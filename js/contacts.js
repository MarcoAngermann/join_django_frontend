/**
 * Initializes the contact functionality by including HTML, loading contacts data asynchronously,
 * and rendering the list of contacts.
 * @return {Promise<void>} A promise that resolves when the initialization is complete.
 */
async function initContact() {
  await includeHTML();
  await contactsArray();
  sortContacts();
  renderListContact();
  console.log(contacts);
}

// function renderListContact() {
//   let listContact = document.getElementById("divList");
//   listContact.innerHTML = "";
//   for (let i = 0; i < contacts.length; i++) {
//     contact = contacts[i];
//     listContact.innerHTML += renderListContactHTML(contact, i);
//   }
// }

async function renderListContact() {
  let user = await loadData("user");
  let userContainer = document.getElementById("loggedUserContainer");
  let listContact = document.getElementById("divList");

  listContact.innerHTML = "";
  userContainer.innerHTML = "";

  if (user && user.username) {
    userContainer.innerHTML = renderUserContainerHTML(user, true);
  } 
  contacts.sort((a, b) => a.name.localeCompare(b.name));
  let currentLetter = "";
  for (let i = 0; i < contacts.length; i++) {
    let contact = contacts[i];

    if (contact.id === user.id) {
      continue;  
    }

    if (!contact.name) {
      console.error("Kontakt ohne Namen gefunden:", contact);
      continue;
    }
    let firstLetter = contact.name.charAt(0).toUpperCase();
    
    if (firstLetter !== currentLetter) {
      currentLetter = firstLetter;
      listContact.innerHTML += `
        <div class="contact-letter-header">${currentLetter}</div>
      `;
    }
    listContact.innerHTML += renderListContactHTML(contact, i);
  }
}

/**
 * Creates a new contact and adds it to the contacts array.
 * @param {Event} event - The event object for the form submission.
 * @return {Promise<void>} - A promise that resolves when the new contact is added and saved to the server.
 */
async function newContact(event) {
  event.preventDefault();
  let nameContact = document.getElementById("nameContact").value;
  let nameContactUpper = nameContact[0].toUpperCase() + nameContact.slice(1);
  let newContact = {
    name: nameContactUpper,
    email: document.getElementById("emailContact").value,
    phone: document.getElementById("phoneContact").value,
    emblem: renderEmblem(nameContact),
    color: colorRandom()
  };

  let saveContact = await postData("contacts", newContact, true);
  contacts.push(saveContact);
  sortContacts();
  renderListContact();
  closeDialog();
  showDetailContact(saveContact.id);
  cleanContactControls();
  console.log(contact);
}

/**
 * Edits an existing contact.
 * @param {Event} event - Das Form-Event.
 * @param {number} index - Der Index des Kontakts im Array.
 */
async function editContact(event, index) {
  event.preventDefault();

  let contactEdit = contacts[index];
  contactEdit.name = document.getElementById("nameContact").value;
  contactEdit.email = document.getElementById("emailContact").value;
  contactEdit.phone = document.getElementById("phoneContact").value;
  contactEdit.emblem = renderEmblem(contactEdit.name);

  await putData(`contacts/${contactEdit.id}`, contactEdit, true);
  sortContacts();
  renderListContact();
  showDetailContact(contactEdit.id);
  closeDialog();
  cleanContactControls();
}

/**
 * Deletes a contact by removing it from the contacts array, clearing the details div,
 * deleting the contact from the server, and re-rendering the list of contacts.
 * @param {number} i - Der Index des Kontakts im Array.
 */
async function deleteContact(i) {
  let contactDelete = contacts[i];
  contacts.splice(i, 1);
  document.getElementById("divDetails").innerHTML = "";

  try {
    await deleteData(`contacts/${contactDelete.id}`, true);
  } catch (error) {
    console.error("Fehler beim Löschen des Kontakts:", error);
  }

  sortContacts();
  renderListContact();
   // Kontakte nach dem Löschen sortieren

  if (window.innerWidth <= 710) {
    backMobileContListe();
  }
}

/**
 * Generates an emblem based on the given name.
 * @param {string} name - The name to generate the emblem from.
 * @return {string} The generated emblem.
 */
function renderEmblem(name) {
  let aux = name.split(" ");
  let capital = "";
  for (let j = 0; j < aux.length; j++) {
    if (j <= 1) {
      capital += aux[j].slice(0, 1).toUpperCase();
    }
  }
  return capital;
}

/**
 * Generates a random color from the given array of colors.
 * @return {string} The randomly generated color.
 */
function colorRandom() {
  return `#${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;
}

/**
 * Sorts the contacts array in ascending order based on the contact's name.
 * @return {void} This function does not return anything.
 */
function sortContacts() {
  contacts = contacts.sort((a, b) => {
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;
    return 0;
  });
}

/**
 * Displays detailed information about a specific contact by ID.
 * @param {number} id - The unique ID of the contact.
 * @return {void}
 */
function showDetailContact(id) {
  let contact = contacts.find((c) => c.id === id);
  if (contact) {
    removeSelectedClassFromAllContacts();
    addSelectedClassToCurrentContact(id);
    displayContactDetails(contact);
  } else {
    console.error(`Contact with ID ${id} not found.`);
  }
}

/**
 * Removes the 'contact-list-container-selected' class from all contact list containers.
 * This function ensures that no contact list container is marked as selected.
 * @return {void} This function does not return anything.
 */
function removeSelectedClassFromAllContacts() {
  let allContactContainers = document.querySelectorAll(
    ".contact-list-container"
  );
  for (let i = 0; i < allContactContainers.length; i++) {
    let container = allContactContainers[i];
    container.classList.remove("contact-list-container-selected");
  }
}

/**
 * Adds the 'contact-list-container-selected' class to the currently selected contact.
 * @param {number} id - The unique ID of the contact.
 * @return {void}
 */
function addSelectedClassToCurrentContact(id) {
  let contactListContainer = document.getElementById(`contact-${id}`);
  if (contactListContainer) {
    contactListContainer.classList.add("contact-list-container-selected");
  } else {
    console.error(`Container for contact ID ${id} not found.`);
  }
}

/**
 * Displays the details of the selected contact.
 * @param {object} contact - The contact object to display.
 * @return {void}
 */
function displayContactDetails(contact) {
  let infoContact = document.getElementById("divDetails");
  infoContact.innerHTML = "";
  infoContact.classList.remove("move-left");
  infoContact.offsetWidth; // Force reflow for animation
  infoContact.classList.add("move-left");
  infoContact.innerHTML += renderContactinList(contact);
  mobileDetails();
}

function openAddContactDialog() {
  openDialog("add");
}

function openEditContactDialog() {
  openDialog("edit");
}

/**
 * Opens the dialog box.
 * @param {string} mode - 'add' für einen neuen Kontakt, 'edit' für einen bestehenden Kontakt.
 * @param {number} [index] - Der Index des Kontakts im Array (nur für 'edit' Modus).
 */
function openDialog(mode, index = null) {
  let dialog = document.getElementById("dialog");
  let dialogContent = document.getElementById("dialogContent");

  dialog.classList.remove("d-none"); // Dialog anzeigen
  dialogContent.innerHTML = ""; // Dialog-Inhalt zurücksetzen

  if (mode === "edit" && index !== null) {
    const contact = contacts[index];
    dialogContent.innerHTML = renderContactDialog("edit", contact, index);
  } else {
    dialogContent.innerHTML = renderContactDialog("add");
  }
}

/**
 * Closes the dialog box.
 * @return {void} This function does not return anything.
 */
function closeDialog() {
  let mobileMode = document.getElementById("amobile_nameContact");
  if (mobileMode != null && mobileMode.style.display == "flex") {
    mobileMode.style.display = "none";
  }
  let dialog = document.getElementById("dialog");
  dialog.classList.add("d-none");
}

/**
 * Displays the details of a newly created contact.
 * @param {Object} newContact - The newly created contact object.
 * @return {void} This function does not return a value.
 */
function showNewContactDetails(newContact) {
  closeDialog();
  cleanContactControls();
  renderListContact();
  document.getElementById("contactCreated").classList.remove("d-none");
  for (let i = 0; i < contacts.length; i++) {
    if (newContact.name == contacts[i].name) {
      let infoContact = document.getElementById("divDetails");
      infoContact.innerHTML = " ";
      infoContact.classList.remove("move-left");
      infoContact.innerHTML += renderContactinList(i);
      mobileDetails();
    }
  }
  contactCreatedDiv();
}

/**
 * Sets a timeout to hide the 'contactCreated' element after 2400 milliseconds.
 * @return {void} This function does not return a value.
 */
function contactCreatedDiv() {
  setTimeout(() => {
    document.getElementById("contactCreated").classList.add("d-none");
  }, 2400);
}

/**
 * Clears the values of the 'nameContact', 'emailContact', and 'phoneContact' input fields.
 * @return {void} This function does not return a value.
 */
function cleanContactControls() {
  document.getElementById("nameContact").value = "";
  document.getElementById("emailContact").value = "";
  document.getElementById("phoneContact").value = "";
}

let mobilWindow = window.matchMedia("(max-width:710px)");
mobilWindow.addEventListener("change", () => myFunc());

/**
 * Function to handle mobile window changes and adjust contact details display accordingly.
 */
function myFunc() {
  if (mobilWindow.matches) {
    document.getElementById("divContactDetails").style.display = "none";
    document.getElementById("divContactList").style.display = "flex";
  } else {
    document.getElementById("divContactDetails").style.display = "flex";
    document.getElementById("divContactList").style.display = "flex";
    let amobileDiv = document.getElementById("amobile_nameContact");
    if (amobileDiv != null) {
      amobileDiv.style.display = "none";
    }
  }
}

/**
 * Toggles the display of the contact details and contact list based on the window width.
 * If the window width is less than or equal to 710 pixels, the contact details are displayed and the contact list is hidden.
 * The 'move-left' class is removed from the 'divDetails' element.
 * @return {void} This function does not return a value.
 */
function mobileDetails() {
  outWidth = window.innerWidth;
  if (outWidth <= 710) {
    document.getElementById("divContactDetails").style.display = "flex";
    document.getElementById("divContactList").style.display = "none";
    document.getElementById("divDetails").classList.remove("move-left");
  }
}

/**
 * Hides the contact details and displays the contact list when the window width is less than or equal to 710 pixels.
 * @return {void} This function does not return a value.
 */
function backMobileContListe() {
  outWidth = window.innerWidth;
  if (outWidth <= 710) {
    document.getElementById("divContactDetails").style.display = "none";
    document.getElementById("divContactList").style.display = "flex";
  }
}

/**
 * Toggles the active state and dropdown menu of the mobile contact button.
 * @param {HTMLElement} button - The button triggering the dropdown toggle.
 */
function toggleActive(button) {
  const mobileMode = document.getElementById("amobile_nameContact");
  if (!mobileMode) return;
  button.classList.toggle("active");
  mobileMode.style.display = button.classList.contains("active")
    ? "flex"
    : "none";

  function handleOutsideClick(event) {
    if (!button.contains(event.target) && !mobileMode.contains(event.target)) {
      button.classList.remove("active");
      mobileMode.style.display = "none";
      document.removeEventListener("click", handleOutsideClick);
    }
  }

  if (button.classList.contains("active")) {
    setTimeout(() => {
      document.addEventListener("click", handleOutsideClick);
    }, 0);
  } else {
    document.removeEventListener("click", handleOutsideClick);
  }
}

/**
 * Closes the dialog box when clicking outside.
 */
function closeDialog() {
  let dialog = document.getElementById("dialog");
  if (dialog) {
    dialog.classList.add("d-none"); // Dialog verstecken
  }
}