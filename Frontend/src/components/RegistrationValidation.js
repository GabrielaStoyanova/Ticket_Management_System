import axios from 'axios';

async function Validation(values) {
    console.log("Role to validate:", values.role);
    let error = {};
    const fullNamePattern = /^[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+$/;
    const passwordHashPattern = /^.{5,}$/;
    const firstNamePattern = /^[A-Z][a-z]*$/;
    const lastNamePattern = /^[A-Z][a-z]*$/;
    const rolePattern = ["Developer", "QA", "Manager"];

    if (values.firstName === "") {
        error.firstName = "Field should not be empty!";
    } else if (!firstNamePattern.test(values.firstName)) {
        error.firstName = "Invalid name!";
    } else {
        error.firstName = "";
    }

    if (values.lastName === "") {
        error.lastName = "Field should not be empty!";
    } else if (!lastNamePattern.test(values.lastName)) {
        error.lastName = "Invalid name!";
    } else {
        error.lastName = "";
    }

    if (values.fullName === "") {
    error.fullName = "Field should not be empty!";
} else if (!fullNamePattern.test(values.fullName)) {
    error.fullName = "Invalid name!";
} else {
    const fullNameParts = values.fullName.trim().split(" ");
    
    if (fullNameParts.length !== 3) {
        error.fullName = "Full name must contain exactly three parts!";
    } else if (
        fullNameParts[0] !== values.firstName ||
        fullNameParts[2] !== values.lastName
    ) {
        error.fullName = "Full name must start with first name and end with last name!";
    } else {
        try {
            const res = await axios.get(`http://localhost:8800/api/checkFullName/${values.fullName}`);
            if (res.data.exists) {
                error.fullName = "Full name already exists!";
            } else {
                error.fullName = "";
            }
        } catch (err) {
            console.error("API error:", err);
            error.fullName = "Error validating full name!";
        }
    }
}

    if (values.passwordHash === "") {
        error.passwordHash = "Field should not be empty!";
    } else if (!passwordHashPattern.test(values.passwordHash)) {
        error.passwordHash = "Invalid password!";
    } else {
        error.passwordHash = "";
    }

    if (values.role === "") {
        error.role = "Field should not be empty!";
    } else if (!rolePattern.includes(values.role)) {
        error.role = "Invalid role";
    } else {
        error.role = "";
    }

    return error;
}

export default Validation;
