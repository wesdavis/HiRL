import Auth from './pages/Auth';
import DevTools from './pages/DevTools';
import Landing from './pages/Landing';
import Profile from './pages/Profile';
import ProfileSetup from './pages/ProfileSetup';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Auth": Auth,
    "DevTools": DevTools,
    "Landing": Landing,
    "Profile": Profile,
    "ProfileSetup": ProfileSetup,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};