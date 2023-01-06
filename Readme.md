# Tesseract ft. sheet

- Install [Homebrew](https://brew.sh/) in your mac.
- Install [Tesseract](https://guides.library.illinois.edu/c.php?g=347520&p=4121425) using th following command: ```brew install tesseract```.
- Go to the [Google Cloud](https://console.cloud.google.com/) Console and create a new project.
- Enable the Google Sheets API for your project.
- Create credentials for your project. You will need to choose "Web server" as the application type and "Application data" as the data access scope.
- Download the JSON file with your credentials and save the file iin the same directory of the project.
- Install dependencies ```npm install```
- Complete .env file with the corresponding values.
- NOTE: You need to share the sheet  with your client_email if is private.
- Create a folder named **tickets_images** in the root path of the proyect and use it to store your tickets.