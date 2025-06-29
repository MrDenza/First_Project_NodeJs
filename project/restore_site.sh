#!/bin/bash
# Скрипт восстановления сайта из бэкапа
# с использованием .my.cnf

# Содержимое .my.cnf
# [client]
# user=ваш_логин
# password=ваш_пароль

# Проверка наличия .my.cnf
if [ ! -f ~/.my.cnf ]; then
  echo "ОШИБКА: Файл ~/.my.cnf не найден!" >&2
  exit 1
fi

# Проверка аргументов
if [ $# -ne 1 ]; then
  echo "Использование: $0 <дата_бэкапа>" >&2
  echo "Пример: $0 20231015_123045" >&2
  exit 1
fi

# Конфигурация
BACKUP_DIR="/home/denza/backups"
RESTORE_DATE="$1"
DB_NAME="file_explorer"
UPLOADS_DIR="/home/denza/First_Project_NodeJs/project/upload"

# Проверка существования бэкапов
DB_BACKUP="$BACKUP_DIR/${DB_NAME}_${RESTORE_DATE}.sql.gz"
UPLOADS_BACKUP="$BACKUP_DIR/uploads_${RESTORE_DATE}.tar.gz"

if [ ! -f "$DB_BACKUP" ]; then
  echo "ОШИБКА: Бэкап БД не найден: $(basename "$DB_BACKUP")" >&2
  exit 1
fi

if [ ! -f "$UPLOADS_BACKUP" ]; then
  echo "ОШИБКА: Бэкап файлов не найден: $(basename "$UPLOADS_BACKUP")" >&2
  exit 1
fi

# Проверка целостности бэкапов
echo "Проверка целостности бэкапов..."
if ! gzip -t "$DB_BACKUP" 2>/dev/null; then
  echo "ОШИБКА: Бэкап БД поврежден!" >&2
  exit 1
fi

if [ -s "$UPLOADS_BACKUP" ] && ! tar -tf "$UPLOADS_BACKUP" >/dev/null 2>&1; then
  echo "ОШИБКА: Бэкап файлов поврежден!" >&2
  exit 1
fi

# Восстановление базы данных
echo "Восстановление базы данных..."
if ! gunzip -c "$DB_BACKUP" | mysql --defaults-file=~/.my.cnf "$DB_NAME"; then
  echo "ОШИБКА: Не удалось восстановить базу данных!" >&2
  exit 1
fi

# Восстановление файлов uploads
echo "Восстановление файлов uploads..."
mkdir -p "$UPLOADS_DIR"

if [ -s "$UPLOADS_BACKUP" ]; then
  echo "Очистка папки uploads перед восстановлением..."
  find "$UPLOADS_DIR" -mindepth 1 -delete

  echo "Распаковка архива..."
  if ! tar -xzf "$UPLOADS_BACKUP" -C "$(dirname "$UPLOADS_DIR")"; then
    echo "ОШИБКА: Не удалось распаковать файлы!" >&2
    exit 1
  fi

  # Установка правильных прав
  chown -R denza:denza "$UPLOADS_DIR"
  chmod -R 755 "$UPLOADS_DIR"
else
  echo "Пропуск восстановления uploads: архив пустой"
fi

echo "----------------------------------------"
echo "Восстановление успешно завершено!"
echo "Восстановлено из:"
echo "- Бэкап БД:    $(basename "$DB_BACKUP")"
echo "- Бэкап файлов: $(basename "$UPLOADS_BACKUP")"
echo "----------------------------------------"

# Восстановление из бэкапа
# Права на выполнение
# chmod +x restore_site.sh
# Список доступных бэкапов
# ls -lh /home/denza/backups/
# Восстановление
# ./restore_site.sh 20231015_123045
# Проверка БД
# mysql -e "SHOW TABLES FROM file_explorer"
# Проверка файлов
# ls -lh /home/denza/First_Project_NodeJs/project/upload