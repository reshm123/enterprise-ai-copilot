import {
  registerUser,
  loginUser,
  getCurrentUser,
  logout as logoutUser,
} from "../../services/auth/auth.service.mjs";

export async function register(req, res) {
  const user = await registerUser(req.body);

  return res.status(201).json({
    success: true,
    message: "Registration successful",
    data: { user },
  });
}

export async function login(req, res) {
  const result = await loginUser(req.body);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
}

export async function me(req, res) {
  const user = await getCurrentUser(req.user.id);

  return res.status(200).json({
    success: true,
    data: { user },
  });
}

export async function logout(req, res) {
  const result = await logoutUser(req.user.id);

  return res.status(200).json({
    success: true,
    ...result,
  });
}