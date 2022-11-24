# Job Portal in MERN
### JobMart - Job Application Portal in MERN stack

This is a website built using MERN stack (MongoDB , ExpressJS , React , NodeJs) which creates a common platform for recruiters and applicants. Recruiters can create jobs with a certain deadline to apply and applicants can view all such available jobs and apply to them. Recruiters have the option to shortlist , accept or reject an application. They can also delete jobs and edit them like changing their deadline or increasing their maximum number of positions

#### Backend
- ##### Models
4 models are used - Applicant , Recruiter , Job and Application. The Recruiter and Applicant table have details about the person like name , email , bio , contact , rating etc. The Job table has fields like title , salary , duration , date of posting etc.. The application table has foreign keys to Applicant ID , Recruiter ID and Job ID and other fileds liek SOP and Date of joining. 

- ##### Files
All the models are stored in the **models** folder. Things like connecting to the database port and the common endpoints are in the **server.js** file.
All applicant related endpoints like registering , profile edit , rating a job are in **applicants.js** and similarly all recruiter related are in **recruiter.js** . Authentication related endpoints are in **auth_applicants.js** and **auth_recruiters.js**. Job related endpoints like creating a job , editing a job , deleting a job are in **jobs.js** and application endpoints like accepting , rejecting , creating are in **applications.js**. 

- ##### Authentication
The authentication of a user is done through his email and passworrd and JWT tokens are used. The token is stored in the local storage. At all times , the user type , name , email , authentication status (true/false) and the token are stored in a common store using React's *context* which is made in **context/UserContext.js**. 
**MongoDB Atlas CLuster** is used as the database and the URI for connection along with the JWT secret is stored in the **config** folder in **default.json**.

#### Frontend
Class Based React is used for the front end and **context** is used to store user data available to all components. Other than App.js , all other components are in the **components** folder which is inside the **src** folder. A mixture of Material-UI and 'react-bootstrap' has been used for the design. 

- ##### Components(filenames)
- Home.js - Common homepage for logged out visitor (/)
- ApplicantHome.js - Applicant home page (/)
- RecruiterHome.js - Recruiter home page (/)
- ApplicantProfile.js - Applicant Profile page (/appProfile)
- RecruiterProfile.js - Recruiter Profile Page (/recProfile)
- Register.js - Register Page (/register)
- Login.js - Login page (/login)
- AppNavbar.js - Navigation Bar (always displayed)
- AppJobs.js - View available job listings by applicant (/appJobs)
- AppApplications.js - View applications by applicant (/appApps)
- RecJobs.js - View jobs created by recruiter (/recJobs)
- RecCreate - Create new job by recruiter (/recCreate)
- JobApps.js - View applications of a job by recruiter (/jobApps/:id)
- RecEmployees - View employees by recruiter (/recEmployees)

#### Details
- An applcant cannot have more than 10 pending applications at a time
- A jobs current number of waiting applications is counted by the number of applications in the 'applied' or 'shortlisted' stage. So rejecting or accepting an application makes space for other applicants to apply
- An applicant after getting a job gets all his other applications rejected and can not apply to another job unless his current job is deleted
- On deleting a job , all its related applications are deleted
- A job which is inactive cannot be accessed again and gets its pending applications rejected
- A job may get its deadline increased
- A job may get its max number of positions or applications changed but not less than 1 , so the minimum number of max applications or positions is 1.
- A recruiter cannot decrease the max applications or positions of a job to lower than its current filled positions or applications
- An applicant can rate a job he/she is hired by only and may only rate it once. Similarly a recruiter may only rate an employee of his once
- The deadline for all jobs is always 12 Am of the date selected. When creating the job the dealine field is at a default state of the current date so it is necessary that the recruiter sets it manually to atleast one day ahead to make it visible to applicants
- An email is sent to the applicants email id when he/she is accepted into a job
- An applicant can also upload a profile picture but make sure not to upload large files (pngs wont work)
- While looking at jobs , an applicant has variety of filter and sorting options along with fuzzy searching by title for the jobs


#### How to run
First run npm install in both folders (backend and frontend) to install all packages and dependencies
- ##### Backend
Go in the backend folder and run "npm run server"
Wait until you see "Database connected" on the console to ensure it is connected to mongodb

- ##### Frontend
Go to the front end folder and run "npm start"



