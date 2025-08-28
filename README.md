# Backroom Pick-Path Optimizer

Java 21 + Spring Boot service that computes an efficient pick route for SKUs in a warehouse, using a Nearest-Neighbor + 2-Opt heuristic on a Manhattan grid. Includes seed data and a small React demo client.

Requirements

- Java: OpenJDK 21 (tested with OpenJDK 21)
- Maven: 3.9+ (tested with Apache Maven 3.9.11)

Quick run (development)

```bash
cd server
mvn spring-boot:run
```

Run tests

```bash
cd server
mvn test
```