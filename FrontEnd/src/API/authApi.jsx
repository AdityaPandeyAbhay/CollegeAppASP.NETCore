const API_URL = "https://localhost:7164/api";

export const loginUser = async (loginData) => {

  const response = await fetch(`${API_URL}/Login`, {

    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(loginData),
  });


  const data = await response.json();


  if (!response.ok) {

    throw new Error(
      data.message ||
      data.Message ||
      "Login failed."
    );
  }


  return data;
};