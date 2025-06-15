function Validation(values){
    
    let error = {}; // error object 
    const fullNamePattern = /^[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+$/;
    // $: End of the string.
    // ^: Start of the string.
    // [A-Z]: Matches an uppercase letter (the first letter of each name should be uppercase).
    // [a-z]+: Matches one or more lowercase letters (the rest of each name should be lowercase).
    // ' ': Matches a space between the names.
    // {3}: Matches exactly three names.
    const passwordHashPattern = /^.{5,}$/; 
    // .{5,}: Matches any character (represented by .) repeated at least 5 times (denoted by {5,}). 
    // $: End of the string.
    // ^: Start of the string.

    if(values.fullName === ""){
        error.fullName = "Name should not be empty!"
    }else if (!fullNamePattern.test(values.fullName)){
        error.fullName="Invalid name!";
    }else{
        error.fullName="";
    }

    if(values.passwordHash === ""){
        error.passwordHash = "Password should not be empty!"
    }else if (!passwordHashPattern.test(values.passwordHash)){
        error.passwordHash="Invalid password!";
    }else{
        error.passwordHash="";
    }
    return error;
}

export default Validation;