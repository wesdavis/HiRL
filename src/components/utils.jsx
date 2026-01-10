export function createPageUrl(pageName) {
  // Converts page names like 'Home' or 'Profile' to '/home' or '/profile'
  return `/${pageName.toLowerCase()}`;
}