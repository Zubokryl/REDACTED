#  Redacted — Next.js + Three.js Web App

An interactive 3D application built with **Next.js 15**, **React 19**, **Three.js**, and **TailwindCSS 4**. It leverages advanced visualization libraries like `@react-three/fiber` and `@react-three/drei`, alongside tools such as `zustand`, `gsap`, `axios`, `framer-motion`, and more.

---

##  Tech Stack

* **Next.js** 15.2.4
* **React** 19
* **Three.js** ^0.175.0
* Zustand, Axios, GSAP, React Hook Form, Framer Motion
* TypeScript, ESLint, PostCSS

---

##  Installation & Setup

> **Requirements**: Node.js v18+ — [https://nodejs.org/](https://nodejs.org/)
>
> npm v9+ (comes with Node.js)

---

###  Step-by-Step Instructions

#### 1. Clone the Repository

```bash
git clone https://github.com/Zubokryl/REDACTED.git
cd REDACTED
```

#### 2. Install All Dependencies

```bash
npm install
```

#### 3. Configure Environment Variables

Create a `.env.local` file in the root directory and add the following:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

> Replace the values if needed.

#### 4. Start the Development Server

```bash
npm run dev
```

Then open your browser at:

```
http://localhost:3000
```

---

##  Used Libraries

###  WebGL / 3D

* `three`
* `@react-three/fiber`
* `@react-three/drei`

###  Animations & UI

* `gsap`
* `framer-motion`
* `tailwindcss`

###  Forms & API Handling

* `axios`
* `react-hook-form`
* `zustand`

---

##  Dependencies from `package.json`

### Runtime (dependencies)

* `next` 15.2.4
* `react` ^19.0.0
* `react-dom` ^19.0.0
* `three` ^0.175.0
* `@react-three/fiber` ^9.1.2
* `@react-three/drei` ^10.0.7
* `zustand` ^5.0.3
* `axios` ^1.8.4
* `gsap` ^3.12.7
* `framer-motion` ^12.7.4
* `react-hook-form` ^7.55.0

### Development (devDependencies)

* `typescript` ^5
* `eslint` ^9
* `eslint-config-next` 15.2.4
* `@eslint/eslintrc` ^3
* `@types/react` ^19.1.2
* `@types/react-dom` ^19
* `@types/node` ^20
* `tailwindcss` ^4.1.3
* `@tailwindcss/postcss` ^4
