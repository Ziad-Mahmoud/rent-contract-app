import Dashboard from './pages/Dashboard';
import Owners from './pages/Owners';
import Units from './pages/Units';
import Tenants from './pages/Tenants';
import Contracts from './pages/Contracts';
import ContractCalendar from './pages/ContractCalendar';
import ContractTemplates from './pages/ContractTemplates';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Owners": Owners,
    "Units": Units,
    "Tenants": Tenants,
    "Contracts": Contracts,
    "ContractCalendar": ContractCalendar,
    "ContractTemplates": ContractTemplates,
    "Notifications": Notifications,
    "Reports": Reports,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};