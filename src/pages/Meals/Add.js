import React, { useState, useEffect } from 'react';

import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik, Form, FormikProvider, ErrorMessage } from 'formik';
import { useQuery, useMutation } from 'react-query';
// material
import { useTheme } from '@mui/material/styles';
import {
  Card,
  Box,
  Container,
  Typography,
  Stack,
  TextField,
  FormControlLabel,
  LinearProgress,
  useMediaQuery,
  Autocomplete,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

// components
import { joinNameInData, setItemWithNameAndCategory, updateValueInArray, setDataWithName } from '../../utils/helpers';
import { GetFormInitialValues } from '../../utils/formHelpers';
import Page from '../../components/Page';
import IOSSwitch from '../../components/IOSSwitch';

import { add as addAPI, get as getAPI, update as updateAPI } from '../../API/meals';
import { getAll as getAllCategories } from '../../API/categories';

import { uploadImage } from '../../API/helpers';
import { queryClient } from '../../utils/queryClient';

import { Addons } from '../../sections/@dashboard/meals';

const MODEL = 'Meal';

const defaultSizes = [
  {
    id: 'small',
    name: {
      en: 'small',
      ar: 'صغير',
    },
    isAvailable: true,
    price: 0,
    isDefault: true,
  },
  {
    id: 'large',
    name: {
      en: 'large',
      ar: 'كبير',
    },
    isAvailable: true,
    price: 0,
    isDefault: false,
  },
];

const defaultNutritionFacts = [
  {
    id: 'calories',
    name: {
      en: 'calories',
      ar: 'سعرات حراريه',
    },
    value: 0,
  },
  {
    id: 'carbs',
    name: {
      en: 'carbs',
      ar: 'الكرب',
    },
    value: 0,
  },
  {
    id: 'protein',
    name: {
      en: 'protein',
      ar: 'بروتين',
    },
    value: 0,
  },
  {
    id: 'fat',
    name: {
      en: 'fat',
      ar: 'الدهون',
    },
    value: 0,
  },
  {
    id: 'saturatedFat',
    name: {
      en: 'saturated fat',
      ar: 'الدهون المشبعة',
    },
    value: 0,
  },
];

const formikFields = [
  { name: 'nameEN', label: 'Name', initialValue: '', type: 'text', inputMode: 'text' },
  { name: 'nameAR', label: 'الاسم', initialValue: '', type: 'text', inputMode: 'text' },
  {
    name: 'category',
    label: 'Category',
    initialValue: '',
    type: 'select',
    options: [],
  },
  { name: 'order', label: 'Order', initialValue: 0, type: 'number', inputMode: 'number' },
  { name: 'isAvailable', label: 'Available', initialValue: false, type: 'switch' },
  { name: 'descriptionEN', label: 'Description', initialValue: '', type: 'text', inputMode: 'text' },
  { name: 'descriptionAR', label: 'الوصف', initialValue: '', type: 'text', inputMode: 'text' },
  { name: 'price', label: 'Price (KD)', initialValue: 0, type: 'number', inputMode: 'number' },
  { name: 'isSubscription', label: 'Available in Subscription', initialValue: false, type: 'switch' },
  { name: 'isShuwaikh', label: 'Available in Shuwaikh', initialValue: false, type: 'switch' },
  { name: 'isFitness', label: 'Available in Fitness', initialValue: false, type: 'switch' },
];

const MealSchema = Yup.object().shape({
  nameEN: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required'),
  nameAR: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required'),
  category: Yup.string().required('Required'),
  order: Yup.number().required('Required'),
  price: Yup.number().required('Required'),
  isAvailable: Yup.boolean(),
  descriptionEN: Yup.string().min(2, 'Too Short!').max(150, 'Too Long!'),
  descriptionAR: Yup.string().min(2, 'Too Short!').max(150, 'Too Long!'),
});

export default function Add() {
  const { id } = useParams();
  const isEdit = !!id;

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up('md'));

  const [fetchedItem, setFetchedItem] = useState(GetFormInitialValues(formikFields));
  const [imageURL, setImageURL] = useState('');

  const [allCategories, setAllCategories] = useState([]);

  const [isSizeRequired, setIsSizeRequired] = useState(true);
  const [sizes, setSizes] = useState(defaultSizes);
  const [sizesUpdated, setSizesUpdated] = useState(false);

  const [nutritionFacts, setNutritionFacts] = useState(defaultNutritionFacts);
  const [nutritionFactsUpdated, setnutritionFactsUpdated] = useState(false);

  const [addons, setAddons] = useState([]);
  const [addonsUpdates, setAddonsUpdated] = useState(false);

  const {
    isLoading: isLoadingGet,
    isError: isErrorGet,
    error: errorGet,
  } = useQuery(`getMeal/${id}`, () => getAPI(id), {
    enabled: isEdit,
    onSuccess(response) {
      const tempItem = setItemWithNameAndCategory(response, setFetchedItem) ?? {};
      setValues(tempItem);
      setImageURL(tempItem?.imageURL);
      setIsSizeRequired(tempItem?.isSizeRequired || true);
      setSizes(tempItem?.sizes || defaultSizes);
      setNutritionFacts(tempItem?.nutritionFacts || defaultNutritionFacts);
      setAddons(tempItem?.addons || []);
    },
  });

  useQuery('getAllCategories', getAllCategories, {
    enabled: true,
    onSuccess(response) {
      setDataWithName(
        response?.map((cat) => ({ label: cat?.name?.en, value: cat?._id })),
        setAllCategories
      );
    },
  });

  const { mutate, isLoading, error } = useMutation((val) => (isEdit ? updateAPI(id, val) : addAPI(val)), {
    onSuccess() {
      queryClient.invalidateQueries(['getAllMeals']);
      navigate('/dashboard/meals', { replace: true });
    },
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: fetchedItem,
    validationSchema: MealSchema,
    onSubmit: async ({ order, ...values }) => {
      const data = joinNameInData({ ...values, order: +order, isSizeRequired, sizes, nutritionFacts, addons });
      if (imageURL) {
        data.imageURL = imageURL;
      }
      mutate(data);
    },
  });

  const {
    initialValues,
    values,
    setValues,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    dirty,
    setFieldValue,
  } = formik;

  const isDirty =
    dirty || initialValues.imageURL !== imageURL || sizesUpdated || nutritionFactsUpdated || addonsUpdates;
  const isButtonDisabled = isSubmitting || !isValid || !isDirty || (isEdit && isErrorGet);

  return (
    <Page title={`Add ${MODEL}`}>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            {isEdit ? 'Edit' : 'Add'} {MODEL}
          </Typography>
        </Stack>
        <Stack direction={isMobile ? 'column' : 'row'} justifyContent="space-between">
          <Card
            style={{
              padding: 20,
              width: isMobile ? '100%' : '48%',
              maxWidth: 500,
              minWidth: 300,
              margin: 10,
            }}
          >
            <Typography variant="h5" style={{ marginBottom: 20 }}>
              Meal Info
            </Typography>
            <FormikProvider value={formik}>
              <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  {formikFields.map((field) => {
                    const { name, label, type, inputMode, options } = field;
                    const value = values ? values[name] : initialValues[name];
                    switch (type) {
                      case 'switch':
                        return (
                          <FormControlLabel
                            control={<IOSSwitch sx={{ m: 1 }} {...getFieldProps(name)} checked={value} />}
                            label={label}
                            {...getFieldProps(name)}
                            value={value}
                          />
                        );
                      case 'number':
                        return (
                          <TextField
                            key={name}
                            fullWidth
                            inputMode={'number'}
                            type={'number'}
                            label={label}
                            {...getFieldProps(name)}
                            value={value}
                            error={Boolean(touched[name] && errors[name])}
                            helperText={touched[name] && errors[name]}
                          />
                        );
                      case 'select':
                        // eslint-disable-next-line no-case-declarations
                        const listOptions = name === 'category' ? allCategories : options;
                        return (
                          <Autocomplete
                            disablePortal
                            id="combo-box-demo"
                            options={listOptions}
                            inputValue={listOptions.find((x) => x.value === value)?.label}
                            // value={value}
                            onChange={(event, { value }) => setFieldValue(name, value)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                key={name}
                                fullWidth
                                label={label}
                                {...getFieldProps(name)}
                                // value={listOptions.find((x) => x.value === value)?.label}
                                error={Boolean(touched[name] && errors[name])}
                                helperText={touched[name] && errors[name]}
                              />
                            )}
                          />
                        );
                      default:
                        return (
                          <TextField
                            key={name}
                            fullWidth
                            inputMode={inputMode}
                            type={type}
                            label={label}
                            {...getFieldProps(name)}
                            value={value}
                            error={Boolean(touched[name] && errors[name])}
                            helperText={touched[name] && errors[name]}
                          />
                        );
                    }
                  })}
                </Stack>
                <ErrorMessage name="form" />
              </Form>
            </FormikProvider>
          </Card>
          <Card
            style={{
              padding: 20,
              width: isMobile ? '100%' : '48%',
              maxWidth: 500,
              minWidth: 300,
              margin: 10,
            }}
          >
            <Typography variant="h5" style={{ marginBottom: 20 }}>
              Image
            </Typography>
            {imageURL && imageURL !== '' ? (
              <Box
                component="img"
                alt={''}
                src={imageURL}
                sx={{ width: '100%', aspectRatio: '2 / 1', flexShrink: 0 }}
              />
            ) : (
              <></>
            )}
            <Stack spacing={3}>
              <input
                id="file"
                name="image"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const reader = new FileReader();
                  reader.readAsDataURL(event.target.files[0]);
                  reader.onload = () => {
                    setImageURL(URL.createObjectURL(event.target.files[0]));
                    uploadImage({ image: event.target.files[0] }).then((resp) => {
                      if (resp) {
                        setImageURL(resp);
                      } else {
                        setImageURL();
                      }
                    });
                  };
                  reader.onerror = (error) => {
                    console.log('Error: ', error);
                  };
                }}
                style={{ marginBottom: 20 }}
              />
            </Stack>
          </Card>
        </Stack>
        <Card style={{ padding: 10, margin: 10 }}>
          <Stack direction="row" alignItems="center" justifyContent="flex-start" mb={5} marginTop={1}>
            <FormControlLabel
              control={
                <IOSSwitch
                  sx={{ m: 1 }}
                  checked={isSizeRequired}
                  onChange={(e) => {
                    setSizesUpdated(true);
                    setIsSizeRequired(e.target.checked);
                  }}
                />
              }
              label={''}
            />
            <Typography variant="h5">Sizes</Typography>
          </Stack>
          {isSizeRequired && (
            <Stack direction={isMobile ? 'column' : 'row'}>
              {sizes?.map(({ id, name, isAvailable, price, isDefault }) => (
                <Box key={id} style={{ width: isMobile ? '100%' : '50%', maxWidth: 500, minWidth: 300, padding: 20 }}>
                  <TextField
                    fullWidth
                    inputMode={'text'}
                    type={'text'}
                    label={'Name'}
                    value={name?.en}
                    onChange={(e) => {
                      setSizes(updateValueInArray(sizes, id, 'name', { en: e.target.value, ar: name?.ar }));
                      setSizesUpdated(true);
                    }}
                    error={isAvailable && name?.en?.length < 2}
                  />
                  <div style={{ marginTop: 20 }} />
                  <TextField
                    fullWidth
                    inputMode={'text'}
                    type={'text'}
                    label={'الاسم'}
                    value={name?.ar}
                    onChange={(e) => {
                      setSizes(updateValueInArray(sizes, id, 'name', { ar: e.target.value, en: name?.en }));
                      setSizesUpdated(true);
                    }}
                    error={isAvailable && name?.en?.length < 2}
                  />
                  <FormControlLabel
                    control={
                      <IOSSwitch
                        sx={{ m: 1 }}
                        checked={isAvailable}
                        onChange={(e) => {
                          setSizes(updateValueInArray(sizes, id, 'isAvailable', e.target.checked));
                          setSizesUpdated(true);
                        }}
                      />
                    }
                    label={'Available'}
                    style={{ marginBottom: 20 }}
                  />
                  <TextField
                    fullWidth
                    inputMode={'number'}
                    type={'number'}
                    label={'Price (KD)'}
                    value={price?.toString()}
                    onChange={(e) => {
                      setSizes(updateValueInArray(sizes, id, 'price', +e.target.value));
                      setSizesUpdated(true);
                    }}
                    disabled={!isAvailable}
                  />
                  <FormControlLabel
                    control={
                      <IOSSwitch
                        sx={{ m: 1 }}
                        checked={isDefault}
                        onChange={(e) => {
                          setSizes(updateValueInArray(sizes, id, 'isDefault', e.target.checked));
                          setSizesUpdated(true);
                        }}
                        disabled={!isAvailable}
                      />
                    }
                    label={'Default'}
                  />
                </Box>
              ))}
            </Stack>
          )}
        </Card>

        <Card style={{ padding: 10, margin: 10 }}>
          <Typography variant="h5" gutterBottom>
            Nutrition Facts
          </Typography>
          <Stack direction={'row'} flexWrap={'wrap'}>
            {nutritionFacts?.map(({ id, name, value }) => (
              <Box key={id} style={{ width: isMobile ? '50%' : '25%', maxWidth: 300, minWidth: 100, padding: 10 }}>
                <TextField
                  fullWidth
                  inputMode={'number'}
                  type={'number'}
                  label={name?.en}
                  value={value?.toString()}
                  onChange={(e) => {
                    setNutritionFacts(updateValueInArray(nutritionFacts, id, 'value', +e.target.value));
                    setnutritionFactsUpdated(true);
                  }}
                />
              </Box>
            ))}
          </Stack>
        </Card>
        <Addons
          value={addons}
          returnValue={(val) => {
            setAddons(val);
          }}
          returnUpdated={(val) => {
            setAddonsUpdated(val);
          }}
        />
        <Stack>
          {(isLoading || isLoadingGet) && (
            <Box sx={{ width: '100%', marginTop: 4 }}>
              <LinearProgress />
            </Box>
          )}
          {(!!error || !!errorGet) && (
            <Typography gutterBottom align="center" variant="subtitle1">
              An Error occured! Please try again
            </Typography>
          )}
          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
            disabled={isButtonDisabled}
            style={{ marginTop: 20 }}
            onClick={handleSubmit}
          >
            {isEdit ? 'Edit' : 'Add'}
          </LoadingButton>
        </Stack>
      </Container>
    </Page>
  );
}
