Switching to liquibase DB control
=================================

The `docker-liquibase.sh` script lets you run liquibase commands against a linked postgres database container.
The `liquibase-local.sh` script lets you run liquibase commands against a postgres database accessible by URL.
Both are initialised with example configurations for gemtc. Change them as needed.

If the GeMTC database is already in use
---------------------------------------

- Ensure through manual inspection that the changeset (in liquibase-changeset.sql) is at the same state as the database. This may involve deleting some recent changesets from the file temporarily.
- Execute `liquibase changelogSync` on the database. This tells liquibase that all changelogs have been executed on the database.
- Restore the deleted changesets to the changelog

Updating the database
---------------------

- Execute `<liquibase-script> update` to apply any further changes (substituting your script of choice).
