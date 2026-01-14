import DevTools from './pages/DevTools';
import Profile from './pages/Profile';
import ProfileSetup from './pages/ProfileSetup';
import Home from './pages/Home';
import Landing from './pages/Landing';
import __Layout from './Layout.jsx';


export const PAGES = {
    "DevTools": DevTools,
    "Profile": Profile,
    "ProfileSetup": ProfileSetup,
    "Home": Home,
    "Landing": Landing,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};