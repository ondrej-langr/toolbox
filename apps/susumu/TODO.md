What is currently missing

- cannot change logged items in previous days
  - It should be possible to edit existing, add or remove new items for selected day with current time.
  - when adding items to previous days there should be prompt to confirm such update before adding it
- cannot change project for existing items
  - it should be possible to click on project for existing item to show the popup with select with available projects
- cannot define own projects
  - users should be able to define their projects and rename them. Also they should be joined with worklogs
  - when this is applied it should also implement the worklog item application versions and data migrations
- worklog entries do not store application versions
  - each worklog should store current application version, application version should be got from package.json during build. For development it should get the current package.json and set it into env variable
  - it should also be possible to create migrations. When application loads it should check any unmigrated data and if there is migration available it should show users migration notes and versions and prompt user to migrate the entries before continuing
