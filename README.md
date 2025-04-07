# FHIR Server Performance Benchmark

## FHIR Server

- Aidbox
- Hapi
- Medplum

## Coverage

CRUD
- [x] Create
- [ ] Read
- [ ] Update
- [ ] Delete

Search
- [ ] Simple search
- [ ] Complex search
- [ ] Full text search

Validation
- [ ] Schema validation
- [ ] Terminology validation

## Run environment

```
docker compose up
```

Activate aidbox http://localhost:8080


## Run tests

```
docker compose run --rm k6
```


## Down environment

```
docker compose down -v
```
