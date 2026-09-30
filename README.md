# Dues Planner

Personal bill and cash-flow planner, served at https://hariprav.in/dues/

- `index.html` is the whole app. It holds no personal data.
- Data lives in the `hari-dues` Firebase project (Firestore), readable only by the accounts allowed in `firestore.rules`.
- `firestore.rules` is a copy of the rules published in the Firebase console. If you change it here, publish it there too.

Do not commit backups (`dues-planner-backup-*.json`) or the local `dues-planner.html` copy: they contain personal data.
