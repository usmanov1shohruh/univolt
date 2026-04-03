### Tokbor data import

- **Input file**: `backend/data/tokbor-stations.json` — массив объектов из Tokbor с полями:
  - `id`, `lat`, `lng`, `status`, `type`, `discounted`, `hasTaxiDiscount`, `icon.left/right/bottom`.
- **Импортёр**: `backend/scripts/merge-tokbor-from-json.cjs`:
  - читает текущий `src/stations/stations.seed.json` и JSON Tokbor;
  - маппит точки Tokbor в единую модель станции (см. код скрипта);
  - добавляет новые станции, избегая дублей по округлённым координатам;
  - пересобирает:
    - `src/stations/stations.seed.json` (красивый JSON для бэкенда);
    - `public/stations.json` (компактный JSON для фронтенда).

Запуск (из директории `backend`):

```bash
node scripts/merge-tokbor-from-json.cjs
```

После перегенерации seed-файла бэкенд автоматически подхватывает станции Tokbor как при in-memory режиме, так и при заполнении Postgres (через `StationsService.onModuleInit`).+
