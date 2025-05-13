
//Этот код — это мок (или имитация) API для регистрации пользователей. 
// Он проверяет, зарегистрирован ли уже пользователь, и если нет, добавляет его в localStorage.

// Определим тип для данных регистрации
interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
}

interface LoginData {
  email: string;
  password: string;
}

// Теперь используем этот интерфейс в функции post
export const api = {
  post: (url: string, data: RegisterData | LoginData) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    if (url === "/register") {
      const userExists = users.some((user: { email: string }) => user.email === (data as RegisterData).email);

      if (userExists) {
        throw new Error("User already exists");
      }

      users.push(data);
      localStorage.setItem("users", JSON.stringify(users));
      return Promise.resolve({ message: "User registered successfully" });
    }

    if (url === "/login") {
      const foundUser = users.find(
        (user: { email: string; password: string }) =>
          user.email === (data as LoginData).email && user.password === (data as LoginData).password
      );

      if (!foundUser) {
        throw new Error("Invalid credentials");
      }

      return Promise.resolve(foundUser); // возвращаем объект пользователя
    }

    return Promise.reject(new Error("Invalid API call"));
  },
};

