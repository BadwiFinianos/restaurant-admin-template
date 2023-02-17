const GetFormInitialValues = (fields) => {
    const initVal = {};
    fields.forEach((field) => {
      initVal[field.name] = field.initialValue;
    });
    return initVal;
  };

  export {GetFormInitialValues}