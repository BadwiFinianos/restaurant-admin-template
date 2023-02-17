import React, { useState, useEffect } from 'react';

import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik, Form, FormikProvider, ErrorMessage } from 'formik';
import { useQuery, useMutation } from 'react-query';
// material
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Container,
  Typography,
  Stack,
  TextField,
  FormControlLabel,
  LinearProgress,
  useMediaQuery,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';

// components
import { joinNameInData, setItemWithName } from '../../utils/helpers';
import { GetFormInitialValues } from '../../utils/formHelpers';
import Page from '../../components/Page';
import IOSSwitch from '../../components/IOSSwitch';

import { add as addAPI, get as getAPI, update as updateAPI } from '../../API/categories';
import { uploadImage } from '../../API/helpers';
import { queryClient } from '../../utils/queryClient';

const MODEL = 'Category';

const formikFields = [
  { name: 'nameEN', label: 'Name', initialValue: '', type: 'text', inputMode: 'text' },
  { name: 'nameAR', label: 'الاسم', initialValue: '', type: 'text', inputMode: 'text' },
  { name: 'order', label: 'Order', initialValue: 0, type: 'number', inputMode: 'number' },
  { name: 'isAvailable', label: 'Available', initialValue: false, type: 'switch' },
];

const CategorySchema = Yup.object().shape({
  nameEN: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required'),
  nameAR: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required'),
  order: Yup.number().required('Required'),
  isAvailable: Yup.boolean(),
});

export default function Add() {
  const { id } = useParams();
  const isEdit = !!id;

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up('md'));

  const [fetchedItem, setFetchedItem] = useState(GetFormInitialValues(formikFields));
  const [imageURL, setImageURL] = useState('');
  const [openErrorMessage, setOpenErrorMessage] = useState(false);

  const {
    isLoading: isLoadingGet,
    isError: isErrorGet,
    error: errorGet,
  } = useQuery(`getCategory/${id}`, () => getAPI(id), {
    enabled: isEdit,
    onSuccess(response) {
      const tempItem =
        setItemWithName(response, setFetchedItem, (err) => {
          console.log('ERRORR', err);
          setFetchedItem(null);
        }) ?? {};
      setValues(tempItem);
      setImageURL(tempItem?.imageURL);
    },
    onError(err) {
      console.log('Error', err);
      setFetchedItem(null);
    },
  });

  const { mutate, isLoading, error } = useMutation((val) => (isEdit ? updateAPI(id, val) : addAPI(val)), {
    onSuccess(data) {
      queryClient.invalidateQueries(['getAllCategories']);
      navigate('/dashboard/categories', { replace: true });
    },
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: fetchedItem,
    validationSchema: CategorySchema,
    onSubmit: async ({ order, ...values }) => {
      const data = joinNameInData({ ...values, order: +order });
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
  } = formik;

  const isButtonDisabled = isSubmitting || !isValid || !dirty || (isEdit && isErrorGet);

  return (
    <Page title={`Add ${MODEL}`}>
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            {isEdit ? 'Edit' : 'Add'} {MODEL}
          </Typography>
        </Stack>
        <Stack direction={isMobile ? 'column' : 'row'}>
          <Box style={{ width: isMobile ? '100%' : '50%', maxWidth: 500, minWidth: 300 }}>
            <FormikProvider value={formik}>
              <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  {formikFields.map((field) => {
                    const { name, label, type, inputMode } = field;
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
          </Box>
          <Box style={{ width: isMobile ? '80%' : '40%', maxWidth: 500, minWidth: 300, marginLeft: 40 }}>
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
          </Box>
        </Stack>
        <Stack>
          {(isLoading || isLoadingGet) && (
            <Box sx={{ width: '100%', marginTop: 4 }}>
              <LinearProgress />
            </Box>
          )}
          {!!error && (
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
