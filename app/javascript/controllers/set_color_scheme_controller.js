import { Controller } from "@hotwired/stimulus";

export default class extends Controller {

  connect() {
    const themeCookie = document.cookie.split('; ').find(row => row.startsWith('theme'));
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark && !themeCookie) {
      document.body.classList.remove('light')
      document.body.classList.add('dark')
      document.cookie = 'theme=dark'
    } else if (themeCookie) {
      const themeColor = themeCookie.split("=")[1]
      if (themeColor === 'dark') {
        document.body.classList.remove('light')
        document.body.classList.add('dark')
      } else if (themeColor === 'light') {
        document.body.classList.remove('dark')
        document.body.classList.add('light')
      }
    }
  }
  
}