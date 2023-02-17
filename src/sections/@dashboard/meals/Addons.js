import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider, ErrorMessage } from 'formik';
// @mui
import {
  Box,
  Card,
  Typography,
  Stack,
  TextField,
  MenuItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  FormControlLabel,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useTheme } from '@mui/material/styles';
// components
import { generateId, joinNameInData } from '../../../utils/helpers';
import Iconify from '../../../components/Iconify';
import IOSSwitch from '../../../components/IOSSwitch';
import Label from '../../../components/Label';

// ----------------------------------------------------------------------

Addons.propTypes = {
  value: PropTypes.array,
  returnValue: PropTypes.func,
  returnUpdated: PropTypes.func,
};

const GetInitialValues = (fields) => {
  const initVal = {};
  fields.forEach((field) => {
    initVal[field.name] = field.initialValue;
  });
  return initVal;
};

const formikFields = [
  { name: 'nameEN', label: 'Name', initialValue: '', type: 'text', inputMode: 'text' },
  { name: 'nameAR', label: 'الاسم', initialValue: '', type: 'text', inputMode: 'text' },
  { name: 'price', label: 'Price (KD)', initialValue: 0, type: 'number', inputMode: 'number' },
  { name: 'isAvailable', label: 'Available', initialValue: false, type: 'switch' },
  { name: 'order', label: 'Order', initialValue: 0, type: 'number', inputMode: 'number' },
];

const AddonSchema = Yup.object().shape({
  nameEN: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required'),
  nameAR: Yup.string().min(2, 'Too Short!').max(50, 'Too Long!').required('Required'),
  order: Yup.number().required('Required'),
  price: Yup.number().required('Required'),
  isAvailable: Yup.boolean(),
});

export default function Addons({ value, returnValue, returnUpdated }) {
  const theme = useTheme();
  const isMobile = !useMediaQuery(theme.breakpoints.up('md'));

  const addons = value;
  const addAddon = async (values) => {
    const id = generateId(6);
    const newAddons = [...addons, joinNameInData({ ...values, id })].sort((a, b) => (a.order < b.order ? -1 : 1));
    resetForm();
    returnUpdated(true);
    returnValue(newAddons);
  };

  const removeAddon = (id) => {
    const newAddons = addons.filter((addon) => addon.id !== id);

    returnValue(newAddons);
    returnUpdated(true);
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: GetInitialValues(formikFields),
    validationSchema: AddonSchema,
    onSubmit: addAddon,
  });

  const {
    initialValues,
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleSubmit,
    getFieldProps,
    dirty,
    resetForm,
  } = formik;

  const isButtonDisabled = !dirty || !isValid;
  return (
    <Card style={{ padding: 10, margin: 10 }}>
      <Typography variant="h4" gutterBottom>
        Addons
      </Typography>
      {addons.map(({ id, name, price, order, isAvailable }) => (
        <Stack key={id} spacing={2} sx={{ p: 3 }} direction={'row'}>
          <Typography variant="subtitle2" noWrap style={{ width: '45%' }}>
            {`( ${order} ) : ${name?.en} - ${name?.ar}`}
          </Typography>
          <Typography variant="subtitle2" noWrap style={{ width: '45%' }}>
            {`KD ${price}`}
          </Typography>
          <Label variant="ghost" color={isAvailable ? 'success' : 'error'}>
            {isAvailable ? 'Available' : 'Not Available'}
          </Label>
          <MenuItem
            sx={{ color: 'error.main' }}
            onClick={() => {
              removeAddon(id);
            }}
          >
            <ListItemIcon>
              <Iconify icon="eva:trash-2-outline" width={24} height={24} color={'error.main'} />
            </ListItemIcon>
            <ListItemText primary="Delete" primaryTypographyProps={{ variant: 'body2' }} />
          </MenuItem>
        </Stack>
      ))}
      <Stack direction={'row'} flexWrap={'wrap'}>
        <FormikProvider value={formik}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <Stack direction={'row'} flexWrap={'wrap'}>
              {formikFields.map((field) => {
                const { name, label, type, inputMode } = field;
                const value = values ? values[name] : initialValues[name];
                switch (type) {
                  case 'switch':
                    return (
                      <Box style={{ width: isMobile ? '50%' : '25%', maxWidth: 300, minWidth: 70, padding: 8 }}>
                        <FormControlLabel
                          control={<IOSSwitch sx={{ m: 1 }} {...getFieldProps(name)} checked={value} />}
                          label={label}
                          {...getFieldProps(name)}
                          value={value}
                        />
                      </Box>
                    );
                  case 'number':
                    return (
                      <Box style={{ width: isMobile ? '50%' : '25%', maxWidth: 300, minWidth: 70, padding: 8 }}>
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
                      </Box>
                    );
                  default:
                    return (
                      <Box style={{ width: isMobile ? '50%' : '25%', maxWidth: 300, minWidth: 70, padding: 8 }}>
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
                      </Box>
                    );
                }
              })}
            </Stack>
            <ErrorMessage name="form" />
          </Form>
        </FormikProvider>
      </Stack>
      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        disabled={isButtonDisabled}
        style={{ marginTop: 20, maxWidth: 200 }}
        onClick={handleSubmit}
      >
        + Add Addon
      </LoadingButton>
      {/* <Box sx={{ pt: '100%', position: 'relative' }}>
        {!category?.isAvailable && (
          <Label
            variant="ghost"
            color={'error'}
            sx={{
              zIndex: 9,
              top: 10,
              left: 24,
              position: 'absolute',
              textTransform: 'uppercase',
            }}
          >
            Not Available
          </Label>
        )}
        <StyledProductImg alt={category?.name?.en} src={category?.imageURL} />
      </Box>

      <Stack spacing={2} sx={{ p: 3 }} direction={'row'}>
        <Typography variant="subtitle2" noWrap style={{ width: '45%' }}>
          {category?.name?.en}
        </Typography>
        <Typography variant="subtitle2" noWrap style={{ textAlign: 'right', width: '45%' }}>
          {category?.name?.ar}
        </Typography>
      </Stack> */}
    </Card>
  );
}
