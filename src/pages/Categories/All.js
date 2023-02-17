import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
// material
import {
  Stack,
  Button,
  Container,
  Typography,
  OutlinedInput,
  InputAdornment,
  Box,
  CircularProgress,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  LinearProgress,
} from '@mui/material';

import { styled } from '@mui/material/styles';
import { getAll as getAllCategories, remove as deleteCategory } from '../../API/categories';
import { setDataWithName } from '../../utils/helpers';
// components
import Page from '../../components/Page';
import Iconify from '../../components/Iconify';
import SearchNotFound from '../../components/SearchNotFound';
import CategoriesList from '../../sections/@dashboard/categories/CategoriesList';
import { queryClient } from '../../utils/queryClient';

const MODEL = 'Category';

const SearchStyle = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': { width: 320, boxShadow: theme.customShadows.z8 },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${theme.palette.grey[500_32]} !important`,
  },
}));

export default function Categories() {
  const navigate = useNavigate();
  const [pageData, setPageData] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const {
    isLoading: isloadingGetAll,
    isError: isErrorGetAll,
    data,
  } = useQuery('getAllCategories', getAllCategories, {
    enabled: true,
    onSuccess(response) {
      setDataWithName(response, setPageData);
    },
  });

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (editId) {
      navigate(`/dashboard/categories/edit/${editId}`, { replace: true });
    }
  }, [editId]);

  const [deleteId, setDeleteId] = useState(null);
  const handleDeleteItem = () => {
    deleteItem(deleteId);
  };

  const handleCloseDelete = () => {
    setDeleteId(null);
  };

  const {
    mutate: deleteItem,
    isLoading: isLoadingDelete,
    isError: isErrorDelete,
  } = useMutation((id) => deleteCategory(id), {
    onSuccess() {
      setDeleteId(null);
      queryClient.invalidateQueries(['getAllCategories']);
    },
  });

  const isLoading = isloadingGetAll || isLoadingDelete;
  const isError = isErrorGetAll || isErrorDelete;

  const handleFilterByName = (event) => {
    if (event.target.value !== '') {
      setFilterName(event.target.value);
      setFilteredData(
        pageData?.filter(
          (val) =>
            val.nameEN.toLowerCase().includes(event.target.value.toLowerCase()) ||
            val.nameAR.toLowerCase().includes(event.target.value.toLowerCase())
        )
      );
    } else {
      setFilterName(event.target.value);
      setFilteredData([]);
    }
  };

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Page title="Categories">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h4" gutterBottom>
            Categories
          </Typography>
          <Button variant="contained" component={RouterLink} to="add" startIcon={<Iconify icon="eva:plus-fill" />}>
            New Category
          </Button>
        </Stack>

        <SearchStyle
          value={filterName}
          onChange={handleFilterByName}
          placeholder="Search category..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
            </InputAdornment>
          }
        />
        {isLoading && (
          <Box sx={{ width: '100%', marginTop: 4 }}>
            <LinearProgress />
          </Box>
        )}
        {isError ? (
          <Typography gutterBottom align="center" variant="subtitle1">
            An Error occured! Please refresh the page
          </Typography>
        ) : (
          pageData?.length === 0 &&
          !isLoading && (
            <Typography gutterBottom align="center" variant="subtitle1">
              {`No ${MODEL} Available`}
            </Typography>
          )
        )}
        {pageData?.length > 0 && (
          <Box style={{ marginTop: 20 }}>
            <Dialog
              fullScreen={fullScreen}
              open={!!deleteId}
              onClose={handleCloseDelete}
              aria-labelledby="responsive-dialog-title"
            >
              <DialogTitle id="responsive-dialog-title">Delete</DialogTitle>
              <DialogContent>
                <DialogContentText>Are you sure you want to delete this {MODEL}</DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button autoFocus onClick={handleCloseDelete}>
                  Cancel
                </Button>
                <Button onClick={handleDeleteItem} autoFocus color="error">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
            <CategoriesList
              categories={filteredData?.length > 0 ? filteredData : pageData}
              onEdit={(id) => {
                setEditId(id);
              }}
              onDelete={(id) => {
                setDeleteId(id);
              }}
            />
          </Box>
        )}
        {!isLoading ? (
          ((filterName !== '' && filteredData?.length === 0) || data?.length === 0) && (
            <SearchNotFound searchQuery={filterName} style={{ paddingTop: 10, paddingBottom: 10, marginTop: 20 }} />
          )
        ) : (
          <Box sx={{ width: '100%', marginTop: 20, alignItems: 'center', justifyContent: 'center', display: 'flex' }}>
            <CircularProgress size={60} />
          </Box>
        )}
      </Container>
    </Page>
  );
}
