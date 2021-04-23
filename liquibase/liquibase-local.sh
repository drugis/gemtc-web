liquibase \
  --changeLogFile=liquibase-changelog.sql \
  --url=jdbc:postgresql://localhost:5432/gemtc \
  --username=gemtc \
  --password=develop \
  --classpath=postgresql-42.2.5.jar \
 $@
