# Тесты аутентификации и авторизации

Этот пакет содержит комплексные тесты для системы аутентификации и авторизации проекта EcoBit, организованные по типам и сервисам.

## 📁 Структура тестов

```
tests/
├── conftest.py                    # Конфигурация pytest и фикстуры
├── unit/                          # Unit тесты
│   └── core/                      # Тесты core компонентов
│       ├── test_token_service.py  # Тесты TokenService
│       └── test_hash_service.py   # Тесты HashService
├── integration/                   # Integration тесты
│   ├── api/                       # Тесты API endpoints
│   │   ├── test_auth_endpoints.py # Тесты API аутентификации
│   │   └── test_user_endpoints.py # Тесты API профиля
│   ├── auth/                      # Тесты аутентификации
│   │   └── test_auth_dependencies.py # Тесты зависимостей
│   └── services/                  # Тесты сервисов
│       └── test_auth_service.py   # Тесты AuthService
└── README.md                      # Документация
```

## 🧪 Типы тестов

### 1. Unit тесты (`tests/unit/`)
**Изолированные тесты отдельных компонентов**

#### Core (`tests/unit/core/`)
- **TokenService** - работа с JWT токенами
- **HashService** - хеширование паролей
- Тестирование утилитарных функций

### 2. Integration тесты (`tests/integration/`)
**Тесты взаимодействия компонентов**

#### API (`tests/integration/api/`)
- **HTTP endpoints** - тестирование REST API
- Валидация запросов и ответов
- Проверка статус кодов

#### Auth (`tests/integration/auth/`)
- **Dependencies** - проверка зависимостей FastAPI
- Извлечение пользователей из токенов
- Проверка авторизации

#### Services (`tests/unit/services/`)
- **AuthService** - бизнес-логика аутентификации
- Тестирование методов входа, верификации, создания токенов
- Мокирование внешних зависимостей

## 🚀 Запуск тестов

### Установка зависимостей
```bash
pip install -r requirements-test.txt
```

### Запуск всех тестов
```bash
pytest
```

