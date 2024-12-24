let categorys = ['Technical Task', 'User Story', 'Development', 'Editing'];
let users = [];
let tasks = [];
let contacts = [];
let isTasksArrayLoading = false;

/**
 * Asynchronously loads the tasks array from the 'tasks' data source and updates the global 'tasks' array.
 *
 * @return {Promise<void>} A Promise that resolves when the tasks array is updated.
 */
async function tasksArray() {
  if (isTasksArrayLoading) {
    return;
  }
  isTasksArrayLoading = true;
  try {
    tasks = [];

    let tasksJson = await loadData('tasks');

    for (let key in tasksJson) {
      let task = tasksJson[key];
      tasks.push(task);
    }
  } finally {
    isTasksArrayLoading = false;
  }
}

/**
 * Asynchronously loads contacts data from the server and populates the contacts array.
 */
async function contactsArray() {
  let contactsJson = await loadData('contacts');
  for (key in contactsJson) {
    let contact = contactsJson[key];
    contacts.push(contact);
  }
}

/**
 * Asynchronously loads the users array from the 'users' data source and updates the global 'users' array.
 *
 * @return {Promise<void>} A Promise that resolves when the users array is updated.
 */
async function usersArray() {
  let usersJson = await loadData('users');
  for (let key in usersJson) {
    let user = usersJson[key];
    users.push(user);
  }
}

/**
 * Asynchronously includes HTML content in elements with the attribute 'w3-include-html'.
 *
 * @return {Promise<void>} A Promise that resolves after including the HTML content.
 */
async function includeHTML() {
  let includeElements = document.querySelectorAll('[w3-include-html]');
  for (let i = 0; i < includeElements.length; i++) {
    const element = includeElements[i];
    file = element.getAttribute('w3-include-html');
    let resp = await fetch(file);
    if (resp.ok) {
      element.innerHTML = await resp.text();
    } else {
      element.innerHTML = 'Page not found';
    }
  }
  focusSidebar();
  focusMobileSidebar();
  getuseremblem();
  openSidebarRules();
}

/**
 * Focuses on the sidebar link that corresponds to the current page.
 *
 * @return {undefined} This function does not return a value.
 */
function focusSidebar() {
  const currentPage = window.location.href.split('/').pop();
  const menu = document.getElementById('mysidebar');
  const navItems = menu.querySelectorAll('.a-nav');

  for (let navItem of navItems) {
    const link = navItem.querySelector('a');
    const linkHref = link.getAttribute('href').replace('./', '');

    // Add "active" class if the link matches the current page, remove otherwise
    if (linkHref === currentPage.replace('?', '')) {
      navItem.classList.add('active');
    } else {
      navItem.classList.remove('active');
    }
  }
}

/**
 * Focuses on the mobile sidebar link that corresponds to the current page.
 *
 * @return {undefined} This function does not return a value.
 */
function focusMobileSidebar() {
  const currentPage = window.location.href.split('/').pop();
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = [...mobileMenu.getElementsByTagName('a')];

  mobileLinks.forEach(link => {
    const linkHref = link.getAttribute('href').replace('./', '');
    link.classList.toggle('active', linkHref === currentPage.replace('?', ''));
    if (linkHref === currentPage.replace('?', '')) {
      link.focus();
    }
  });
}

async function getUserLogin() {
  const token = sessionStorage.getItem('token') || localStorage.getItem('token');
  if (!token) {
    console.error('No token found in session or local storage.');
    return null;
  }

  try {
    const user = await loadData('user'); // API-Endpoint '/user/'
    if (user) {
      console.log('Logged-in user:', user);
      return user;
    } else {
      console.warn('No user found matching the provided token.');
      return null;
    }
  } catch (error) {
    console.error('Error loading user:', error);
    return null;
  }
}


/**
 * Asynchronously retrieves the user object from the 'users' data source based on the user token stored in the session storage.
 *
 * @return {Promise<Object|null>} A Promise that resolves to the user object if found, or null if not found.
 */
async function getGuestLogin(event) {
  event.preventDefault();
  try {
    const response = await postData("guest-login", {}, false);
    if (response.token) {
      sessionStorage.setItem("token", response.token);
      sessionStorage.setItem("isGuest", "true");
      location.href = "./templates/summary.html";
    } else {
      console.error("Guest Login: No token received");
    }
  } catch (error) {
    console.error("Fehler beim Gast-Login:", error);
    alert("Gast-Login fehlgeschlagen. Bitte versuchen Sie es erneut.");
  }
}

/**
 * Asynchronously retrieves the current user's emblem and updates the 'emblemUser' element with it.
 *
 * @return {Promise<void>} A Promise that resolves when the emblem has been updated.
 */
async function getuseremblem() {
  let currentUser = await getUserLogin();
  if (currentUser != null) {
    let emblemUser = document.getElementById('emblemUser');
    emblemUser.innerHTML = currentUser.emblem;
  } else {
    emblemUser.innerHTML = '';
  }
}

/**
 * Asynchronously retrieves the current user's emblem and updates the 'emblemUser' element with it.
 *
 * @return {Promise<void>} A Promise that resolves when the emblem has been updated.
 */
async function getuseremblem() {
  let currentUser = await getUserLogin();
  if (currentUser != null) {
    let emblemUser = document.getElementById('emblemUser');
    emblemUser.innerHTML = currentUser.emblem;
  } else {
    emblemUser.innerHTML = '';
  }
}

/**
 * Logs out the current user by removing the user ID from session storage and redirecting to the index page.
 *
 * @return {void} This function does not return anything.
 */
async function userLogOut() {
  const isGuest = sessionStorage.getItem("isGuest");
  if (isGuest) {
    await postData("guest-logout", {}, true);
    sessionStorage.removeItem("isGuest");
  }

  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  console.log("Token entfernt. Benutzer abgemeldet.");
  window.location.href = "../index.html";
}

/**
 * Asynchronously opens the sidebar rules for the current user. If the user is not logged in,
 * the sidebar and mobile sidebar are hidden, and the back button is set to redirect to the index page.
 *
 * @return {Promise<void>} A Promise that resolves when the sidebar rules are opened.
 */
async function openSidebarRules() {
  let currentUser = await getUserLogin();
  let sidebarRules = document.getElementById('menu');
  let mobileSidebarRules = document.getElementById('mobile-mysidebar');
  if (currentUser == null) {
    sidebarRules.style.display = 'none';
    mobileSidebarRules.style.display = 'none';
    let arrowBack = document.getElementById('backSummaryRules');
    arrowBack.href = '../index.html';
  }
}