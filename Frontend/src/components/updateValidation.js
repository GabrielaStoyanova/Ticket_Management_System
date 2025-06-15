function Validation(values) {
    let error = {};

    const statePattern = ['New', 'In progress', 'Review', 'Done'];
    const priorityPattern = ['1 Critical', '2 High', '3 Moderate', '4 Low'];

    // Short Description
    if (values.shortDescription === "") {
        error.shortDescription = "Field should not be empty!";
    } else if (values.shortDescription.length > 150) {
        error.shortDescription = "Short description cannot exceed 150 characters!";
    } else {
        error.shortDescription = "";
    }

    // Description
    if (values.description && values.description.length > 250) {
        error.description = "Description cannot exceed 250 characters!";
    } else {
        error.description = "";
    }

    // AssignedTo
    if (values.assignedTo === "") {
        error.assignedTo = "Field should not be empty!";
    } else if (typeof values.assignedTo !== 'number' && isNaN(values.assignedTo)) {
        error.assignedTo = "Invalid number!";
    } else {
        error.assignedTo = "";
    }

    // State
    if (values.state === "") {
        error.state = "Field should not be empty!";
    } else if (!statePattern.includes(values.state)) {
        error.state = "Invalid state!";
    } else {
        error.state = "";
    }

    // Priority
    if (values.priority === "") {
        error.priority = "Field should not be empty!";
    } else if (!priorityPattern.includes(values.priority)) {
        error.priority = "Invalid priority!";
    } else {
        error.priority = "";
    }

    // JiraID
    if (values.jiraID === "") {
        error.jiraID = "Field should not be empty!";
    } else if (typeof values.jiraID !== 'number' && isNaN(values.jiraID)) {
        error.jiraID = "Invalid number!";
    } else {
        error.jiraID = "";
    }

    return error;
}

export default Validation;
