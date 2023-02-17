const setData = (response, setter, onError) => {
  const { code, data } = response;
  if (code === 200) {
    setter(data);
  } else {
    onError(data);
  }
};

const setDataWithName = (data, setter) => {
  setter(data.map((val) => ({ ...val, ...getNameLocalized(val) })));
};

const setItemWithName = (data, setter) => {
  const value = { ...data, ...getNameLocalized(data) };
  setter(value);
  return value;
};

const setItemWithNameAndCategory = (data, setter) => {
  const value = { ...data, ...getNameLocalized(data), category: data?.category?._id };
  setter(value);
  return value;
};

const getNameLocalized = ({ name }) => ({ nameEN: name?.en, nameAR: name?.ar });

const joinNameInData = (data) => ({ name: { en: data.nameEN, ar: data.nameAR }, ...data });

const updateValueInArray = (array, id, key, newValue) => {
  const newArray = [...array];
  newArray.find((item) => item.id === id)[key] = newValue;
  return newArray;
};

const generateId = (length) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i <= length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export {
  setData,
  setDataWithName,
  setItemWithName,
  setItemWithNameAndCategory,
  getNameLocalized,
  joinNameInData,
  updateValueInArray,
  generateId,
};
