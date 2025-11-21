# Vintage Resorts – Fullstack Web Application

Detta projekt är en fullständig webbapplikation utvecklad med **React + Vite**, **Node/Express**, **TypeScript**, och **MongoDB**. 

## Funktioner

### Frontend
- Byggt med React + Vite
- Responsivt gränssnitt (mobil, tablet, desktop)
- Sökflöde: plats, datum, gäster
- Resultatsida + filtrering
- Detaljsida för boende
- Bokningsflöde (validering + summering)
- Inloggning, registrering och mina bokningar
- Adminpanel för boenden (CRUD)
- Global state (Context)
- Tailwind CSS

### Backend
- Node.js + Express + TypeScript
- MongoDB (Mongoose)
- Authentication (JWT)
- Validering och felhantering
- CORS, dotenv, middleware

## Installation

## 1. Klona projektet
    git clone <repo-url>
    cd project-foder

## 2.Installera frontend
   cd frontend
   npm install
   npm run dev
## 3.Installera backend
    cd backend
    npm install
    npm run dev
## 4. Miljövariabler  
   ## backend
   PORT=
   MONGO_URI=
   NODE_ENV=
   ACCESS_TOKEN_SECRET= 

   ## frontend
   VITE_API_URL 

## Testade användarflöden

Registrering
Inloggning
Sök flöde (plats, datum, gäster)
Visa resultat
Visa detaljsida
Skapa bokning
Visa mina bokningar
Admin: skapa boende
Admin: redigera boende
Admin: ta bort boende
Alla flöden testades manuellt och fungerar






