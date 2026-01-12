export function createPageUrl(pageName) {
  if (!pageName) return '/';
  
  const name = pageName.toLowerCase();

  // CRITICAL FIX: Map 'home' to root '/'
  if (name === 'home') return '/';
  
  // Landing also goes to root now
  if (name === 'landing') return '/';
  
  if (name === 'profile') return '/profile';
  if (name === 'devtools' || name === 'dev-tools') return '/dev-tools';

  return `/${name}`;
}
