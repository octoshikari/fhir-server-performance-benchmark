package main

import (
	"archive/tar"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"mime"
	"os"
	"path/filepath"

	"net/http"
)

const CURRENT = ".current"
const STORAGE = "/data"

func main() {
	if len(os.Args) < 2 {
		log.Fatal("provide the .tar.gz url to download")
	}

	if err := downloadTgz(os.Args[1]); err != nil {
		log.Fatal(err)
	}

	http.HandleFunc("/", handler)
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func handler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path == "/" {
		files, err := listFiles()
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(http.StatusUnprocessableEntity), 422)
			return
		}

		out, err := json.Marshal(files)
		if err != nil {
			log.Println(err)
			http.Error(w, http.StatusText(http.StatusUnprocessableEntity), 422)
			return
		}

		w.Header().Set("Content-Type", "application/json; charset=utf-8")
		_, _ = w.Write(out)
		return
	}

	if r.URL.Path == "/healthz" {
		_, _ = w.Write([]byte("OK"))
		return
	}

	file, err := os.Open(STORAGE + r.URL.Path)
	if err != nil {
		log.Println(err)
		http.NotFound(w, r)
		return
	}
	defer file.Close()
	ctype := mime.TypeByExtension(filepath.Ext(r.URL.Path))
	if ctype == "" {
		w.Header().Set("Content-Type", "application/json; charset=utf-8")
	} else {
		w.Header().Set("Content-Type", ctype)
	}
	w.Header().Set("Content-Encoding", "gzip")
	_, _ = io.Copy(w, file)
}

func isCurrent(url string) bool {
	current, err := os.ReadFile(STORAGE + "/" + CURRENT)
	if err == nil && string(current) == url {
		return true
	}
	return false
}

func downloadTgz(url string) error {
	if isCurrent(url) {
		log.Printf("already downloaded %s", url)
		return nil
	}
	log.Printf("downloading %s", url)

	remote, err := http.Get(url)
	if err != nil {
		return nil
	}
	defer remote.Body.Close()

	if remote.StatusCode != http.StatusOK {
		return fmt.Errorf("bad status: %s", remote.Status)
	}

	gzReader, err := gzip.NewReader(remote.Body)
	if err != nil {
		return nil
	}
	defer gzReader.Close()

	tarReader := tar.NewReader(gzReader)
	for {
		header, err := tarReader.Next()
		if err == io.EOF {
			break
		}
		if err != nil {
			return err
		}
		if header.Typeflag != tar.TypeReg {
			continue
		}

		if err := saveToFile(filepath.Base(header.Name), tarReader); err != nil {
			return err
		}
	}

	if err := saveCurrent(url); err != nil {
		return err
	}

	log.Println("download completed")

	return nil
}

func listFiles() ([]string, error) {
	files, err := os.ReadDir(STORAGE)
	if err != nil {
		return nil, err
	}

	var list []string

	for _, file := range files {
		if file.Name() != CURRENT {
			list = append(list, file.Name())
		}
	}

	return list, nil
}

func saveCurrent(url string) error {
	return os.WriteFile(STORAGE+"/"+CURRENT, []byte(url), 0666)
}

func saveToFile(filename string, content io.Reader) error {
	file, err := os.Create(STORAGE + "/" + filename)
	if err != nil {
		return nil
	}
	defer file.Close()

	gz := gzip.NewWriter(file)
	defer gz.Close()

	_, err = io.Copy(gz, content)
	return err
}
