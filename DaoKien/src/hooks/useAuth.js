import { useState, useEffect } from "react";

export default function useAuth() {
    const [user, setUser] = useState(null);
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch("/data/toeicPractice.json")
            .then((res) => res.json())
            .then((json) => {
                setData(json);

                const saved = localStorage.getItem("user");
                if (saved) setUser(JSON.parse(saved));
            });
    }, []);

    const login = (email, password) => {
        if (!data) return null;

        const found = data.users.find(
            (u) => u.Email === email && u.Password === password
        );

        if (!found) return null;

        const userRole = data.userRoles.find((ur) => ur.UserID === found.ID);
        const role = data.roles.find((r) => r.ID === userRole.RoleID);

        const userData = {
            ...found,
            role: role.Value,
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        return userData;
    };

    // ⭐ REGISTER: lưu vào localStorage (giả lập DB)
    const register = (info) => {
        const newUser = {
            ID: Date.now(),
            Email: info.email,
            Password: info.password,
            FullName: info.name,
            Sex: info.sex,
            Birthday: info.birthday,
            Phone: info.phone,
            Address: info.address,
            Status: "active",
        };

        // gán role mặc định = Student
        const userData = {
            ...newUser,
            role: "Student",
        };

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        return userData;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    return { user, login, register, logout, data };
}
