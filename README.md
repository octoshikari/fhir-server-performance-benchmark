# FHIR Server Performance Benchmark

## FHIR Server

- Aidbox
- Hapi
- Medplum

## Local development

```sh
docker compose up
```

Open [http://localhost:13080](http://localhost:13080) and activate Aidbox.

### Infrastructure

| Services   | Local address                                 | Internal address |
|------------|----------------------------------------|-----------------|
| Aidbox     | [http://localhost:13080](http://localhost:13080) | [http://aidbox:8080](http://aidbox:8080) |
| Hapi       | [http://localhost:13090](http://localhost:13090) | [http://hapi:8080](http://hapi:8080) |
| Medplum    | - | [http://medplum:8103](http://medplum:8103) |
| Grafana    | [http://localhost:13000](http://localhost:13000) | [http://grafana:3000](http://grafana:3000) |
| Prometheus | [http://localhost:13010](http://localhost:13010) | [http://prometheus:9090](http://prometheus:9090) |


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
docker compose run --name perf-k6 --rm k6
```


## Down environment

```
docker compose down -v
```
