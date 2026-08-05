# Expense Manager v1.0.0

A modern, fast, and offline desktop application for managing personal finances. Built with Electron, Vue 3, Tailwind CSS, and SQLite.

## Key Features
- **Dashboard:** Overview of income, expenses, and net balance with beautiful interactive charts.
- **Transactions:** Add, edit, or archive your daily income and expenses.
- **Categories:** Manage custom categories with colors and icons.
- **Data Management:** Backup/Restore your SQLite database and Export your data to CSV or Excel.
- **Settings:** Customize UI theme (Light/Dark/System), Currency, and Date formats.

## Tech Stack
- Electron & Vite
- Vue 3 & Pinia & Vue Router
- Tailwind CSS & Shadcn Vue
- SQLite & better-sqlite3 & Drizzle ORM
- Chart.js & ExcelJS

## 💻 Installation (Development)

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd expense-manager
   ```
2. Install dependencies using pnpm:
   ```bash
   pnpm install
   ```
3. Run the application in development mode:
   ```bash
   pnpm dev
   ```

## 🚀 Build & Deploy for Production

To package the application into a standalone installer (`.exe` on Windows):

1. Run the build command:
   ```bash
   pnpm run build
   ```
2. **Locate the Installer:** Once the build process finishes, navigate to the `release/1.0.0/` folder in your project directory.
3. **Distribute:** You will find a file named `Expense Manager-Windows-1.0.0-Setup.exe`. You can distribute this file directly to users. 

**Note on Database:** The SQLite database is automatically generated in the user's OS AppData folder upon installation. Users do not need to install any database services or Node.js to use the app.

## Data Privacy
Expense Manager is a 100% offline desktop application. All your data is stored locally in an SQLite database on your machine. No cloud synchronization or tracking is performed.
