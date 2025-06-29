#!/bin/bash
# Скрипт полного бэкапа сайта: базы данных + файлы uploads
# с использованием .my.cnf

# Содержимое .my.cnf
# [client]
# user=ваш_логин
# password=ваш_пароль

BACKUP_DIR="/home/denza/backups"
DB_NAME="file_explorer"
UPLOADS_DIR="/home/denza/First_Project_NodeJs/project/upload"
DATE=$(date +%Y%m%d_%H%M%S)

# Проверка наличия .my.cnf
if [ ! -f ~/.my.cnf ]; then
  echo "ОШИБКА: Файл ~/.my.cnf не найден!" >&2
  exit 1
fi

# Проверка доступности MySQL
if ! mysql -e "SHOW DATABASES" >/dev/null 2>&1; then
  echo "ОШИБКА: Не удалось подключиться к MySQL. Проверьте ~/.my.cnf" >&2
  exit 1
fi

# Проверка существования БД
if ! mysql -e "USE $DB_NAME" >/dev/null 2>&1; then
  echo "ОШИБКА: База данных $DB_NAME не существует!" >&2
  exit 1
fi

# Создаем директорию для бэкапов
mkdir -p "$BACKUP_DIR"

# Бэкап базы данных (с использованием .my.cnf)
echo "Создание бэкапа базы данных..."
mysqldump --defaults-file=~/.my.cnf --no-tablespaces "$DB_NAME" | gzip > "$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"

# Бэкап папки uploads
echo "Создание бэкапа файлов uploads..."
if [ -d "$UPLOADS_DIR" ]; then
    tar -czf "$BACKUP_DIR/uploads_${DATE}.tar.gz" -C "$(dirname "$UPLOADS_DIR")" "$(basename "$UPLOADS_DIR")"
else
    echo "Предупреждение: Папка $UPLOADS_DIR не существует! Создаю пустой архив."
    touch "$BACKUP_DIR/uploads_${DATE}.tar.gz"
fi

# Проверка целостности
check_backup() {
  echo "Проверка целостности бэкапов..."

  # Проверка БД
  if ! gzip -t "$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz" 2>/dev/null; then
    echo "ОШИБКА: Бэкап БД поврежден!" >&2
    rm -f "$BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"
    return 1
  fi

  # Проверка файлов
  if [ -s "$BACKUP_DIR/uploads_${DATE}.tar.gz" ]; then
    if ! tar -tf "$BACKUP_DIR/uploads_${DATE}.tar.gz" >/dev/null 2>&1; then
      echo "ОШИБКА: Бэкап файлов поврежден!" >&2
      rm -f "$BACKUP_DIR/uploads_${DATE}.tar.gz"
      return 1
    fi
  fi

  return 0
}

if check_backup; then
  echo "Бэкап успешно создан:"
  echo "- БД: $BACKUP_DIR/${DB_NAME}_${DATE}.sql.gz"
  echo "- Файлы: $BACKUP_DIR/uploads_${DATE}.tar.gz"

  # Очистка старых бэкапов
  find "$BACKUP_DIR" -name '*.gz' -mtime +30 -delete
else
  echo "Процесс бэкапа завершился с ошибками!" >&2
  exit 1
fi

# Создание бэкапа:
# chmod +x backup_site.sh
# ./backup_site.sh
# ls -lh /home/denza/backups/