// bot scrapper to enter to https://prenotami.esteri.it/ in chromium

const puppeteer = require("puppeteer");
require("dotenv").config();
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msgSuccess = {
  to: ["rodrimarchese@gmail.com", "mdsaliva@gmail.com"], // Change to your recipient
  from: "rodrimarchese@hotmail.com", // Change to your verified sender
  subject: "Test",
  text: "where is this",
  html: "<strong>Hay turnos!! ->> </strong> <a>https://prenotami.esteri.it</a>",
};

const msgNoSuccess = {
  to: ["rodrimarchese@gmail.com"], // Change to your recipient
  from: "rodrimarchese@hotmail.com", // Change to your verified sender
  subject: "Test",
  text: "where is this",
  html: "<strong>Hay turnos!! ->> </strong> <a>https://prenotami.esteri.it</a>",
};

const url = "https://prenotami.esteri.it/"; // url to scrap

const email = process.env.EMAIL;
const password = process.env.PASSWORD;

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });
  const page = await browser.newPage();
  await page.goto(url);

  //wait for email input selector //*[@id="login-email"]
  const emailSelector = "#login-email";
  await page.waitForSelector(emailSelector);

  console.log("emailSelector: ", emailSelector);

  // type email
  await page.type(emailSelector, email);

  // wait for password input selector //*[@id="login-password"]
  const passwordSelector = "#login-password";
  await page.waitForSelector(passwordSelector);

  console.log("passwordSelector: ", passwordSelector);

  // type password
  await page.type(passwordSelector, password);
  //   await page.screenshot({ path: "screenshot1.png" });

  // wait for login button selector //*[@id="login-form"]/button
  const loginButtonSelector = "#login-form > button";
  await page.waitForSelector(loginButtonSelector);

  console.log("loginButtonSelector: ", loginButtonSelector);

  // click login button
  // Hacer clic en el botón de inicio de sesión
  let loginClicked = false;
  let retries = 0;
  while (!loginClicked && retries < 3) {
    try {
      // hacer clic en el botón de inicio de sesión
      await page.click(loginButtonSelector);

      loginClicked = true;
    } catch (err) {
      console.log(
        `Error al hacer clic en el botón de inicio de sesión: ${err.message}`
      );
      retries++;
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Esperar 1 segundo antes de intentar de nuevo
    }
  }
  //   await page.click(loginButtonSelector);

  //   await page.screenshot({ path: "screenshot2.png" });

  // ----------------- after login -----------------

  // add delay to wait for page to load
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // navigate to https://prenotami.esteri.it/Services
  await page.goto("https://prenotami.esteri.it/Services");

  // wait page to load
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // take screenshot
  //   await page.screenshot({ path: "screenshot3.png" });

  //   // wait for #main > nav selector
  //   const navSelector = "#main > nav";
  //   await page.waitForSelector(navSelector);

  //   console.log("navSelector: ", navSelector);

  //   //wait for #main > nav > ul.app-menu__menu selector
  //   const menuSelector = "#main > nav > ul.app-menu__menu";
  //   await page.waitForSelector(menuSelector);

  //   //wait for //*[@id="advanced"] selector
  //   const advancedSelector = "#advanced";
  //   await page.waitForSelector(advancedSelector);

  //   // click //*[@id="advanced"] selector
  //   await page.click(advancedSelector);

  // wait for //*[@id="dataTableServices"]/tbody/tr[3]/td[1] selector
  const tableSelector =
    "#dataTableServices > tbody > tr:nth-child(3) > td:nth-child(1)";
  await page.waitForSelector(tableSelector);

  console.log("tableSelector: ", tableSelector);

  //wait for //*[@id="dataTableServices"]/tbody/tr[3]/td[4]/a selector
  const bookSelector =
    "#dataTableServices > tbody > tr:nth-child(3) > td:nth-child(4) > a";

  await page.waitForSelector(bookSelector);

  // click //*[@id="dataTableServices"]/tbody/tr[3]/td[4]/a selector
  await page.click(bookSelector);

  //   await new Promise((resolve) => setTimeout(resolve, 5000)); // wait for 5 seconds

  //wait for "body > div.jconfirm.jconfirm-light.jconfirm-open"selector, and get text, to compare with: "Al momento non ci sono date disponibili per il servizio richiesto"
  const noDatesSelector = "body > div.jconfirm.jconfirm-light.jconfirm-open";
  await page.waitForSelector(noDatesSelector);

  const noDatesText = await page.evaluate((noDatesSelector) => {
    return document.querySelector(noDatesSelector).innerText;
  }, noDatesSelector);

  const textNoDates =
    "Al momento non ci sono date disponibili per il servizio richiesto\nOK";

  if (noDatesText === textNoDates) {
    console.log("Todavia no hay fechas disponibles...");
  } else {
    console.log("Hay fechas disponibles!!!");
    sgMail
      .send(msgSuccess)
      .then(() => {
        console.log("Email sent");
      })
      .catch((error) => {
        console.error(error);
      });
  }

  await browser.close();
})();
