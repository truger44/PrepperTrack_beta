# PrepperTrack
(currently a work in progress, bugs are most likly present)

**Self-Hosted Prepper Supply & Food Shelf-Life Tracker**

Take control of your emergency preparedness with **SurviveTrack**, a self-hosted web app designed for preppers, homesteaders, and self-reliant families. SurviveTrack helps you log, organize, and calculate your food and supply inventory—so you know exactly what you have, what’s expiring soon, and how long your stash will last.

---

## 🔐 Features

- **Self-Hosted & Private**  
  Your data stays on your server. No cloud services, no external tracking.

- **Track Food & Supplies**  
  Log canned goods, freeze-dried meals, water, fuel, medicine, ammo—anything you’re storing. Supports expiration dates, quantities, and categories.

- **Shelf-Life Countdown**  
  Get automatic alerts for upcoming expiration dates. Stay ahead with smart rotation reminders.

- **Survival Duration Calculator**  
  Input your household size and SurviveTrack will calculate how long your supplies will last, using calorie, water, and usage estimates.

- **Smart Inventory Management**  
  Tag items by storage location, usage type (daily, emergency, barter), or custom tags. Filter and search with ease.

- **Data Visualizations**  
  View dashboards and reports showing stock levels, critical shortages, and overstocked categories.

---

## 🚀 Getting Started

This should be installed on a Raspberry pi unless you have the resouces to maintain a server during a grid down situtation.

### Requirements

- Node.js or Docker (TBD based on implementation)
- MongoDB / PostgreSQL (or other supported DB)
- Web server (e.g., Nginx, Caddy)

### Installation

```bash
# Clone the repo
gh repo clone truger44/PrepperTrack_beta
cd preppertrack

# Install dependencies
npm install

# Start the app
npm run dev



## Roadmap
✅ Basic inventory tracking

✅ Expiry alerts

✅ Survival duration calculator

✅ Multi-group / person support

⏳ Mobile-friendly interface (untested)

✅ Import/export data via CSV/JSON

⏳ Plugin system (adds external battery pack monitoring, integration with home assistant api)

----
## License
Creative Commons Attribution-NonCommercial (CC BY-NC 4.0)
https://creativecommons.org/licenses/by-nc/4.0/
