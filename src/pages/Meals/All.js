import { filter } from 'lodash';
import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
// material
import {
  Box,
  Card,
  Table,
  Stack,
  Button,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  CardMedia,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  LinearProgress,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

import { getAll as getAllMeals, remove as deleteMeal } from '../../API/meals';
import { setDataWithName } from '../../utils/helpers';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Scrollbar from '../../components/Scrollbar';
import Iconify from '../../components/Iconify';
import SearchNotFound from '../../components/SearchNotFound';
import { UserListHead, UserListToolbar, MoreMenu } from '../../sections/@dashboard/user';
import { queryClient } from '../../utils/queryClient';

const MODEL = 'Meal';
// mock
// import USERLIST from '../../_mock/user';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'imageURL', label: '', alignRight: false },
  { id: 'nameEN', label: 'Name (EN)', alignRight: false },
  { id: 'nameAR', label: 'Name (AR)', alignRight: true },
  { id: 'category', label: 'Category', alignRight: false },
  { id: 'price', label: 'Price', alignRight: false },
  { id: 'sizes', label: 'Sizes', alignRight: false },
  { id: 'isAvailable', label: 'Available', alignRight: false },
  { id: '' },
];

const DefaultColors = ['warning', 'default', 'info', 'success', 'primary', 'secondary'];
// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(
      array,
      (val) =>
        val.nameEN.toLowerCase().indexOf(query.toLowerCase()) !== -1 ||
        val.nameAR.toLowerCase().indexOf(query.toLowerCase()) !== -1
    );
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function Meals() {
  const navigate = useNavigate();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const [pageData, setPageData] = useState([]);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const {
    isLoading: isLoadingGetAll,
    isError: isErrorGetAll,
    isRefetching: isRefetchingGetAll,
  } = useQuery('getAllMeals', getAllMeals, {
    enabled: true,
    onSuccess(response) {
      setDataWithName(response, setPageData);
    },
  });

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = pageData.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - pageData.length) : 0;

  const filteredMeals = applySortFilter(pageData, getComparator(order, orderBy), filterName);

  const isMealNotFound = filteredMeals.length === 0;

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    if (editId) {
      navigate(`/dashboard/meals/edit/${editId}`, { replace: true });
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
  } = useMutation((id) => deleteMeal(id), {
    onSuccess() {
      setDeleteId(null);
      queryClient.invalidateQueries(['getAllCategories']);
    },
  });

  const isLoading = isLoadingGetAll || isLoadingDelete || isRefetchingGetAll;
  const isError = isErrorGetAll || isErrorDelete;

  return (
    <Page title="Meals">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Meals
          </Typography>
          <Button variant="contained" component={RouterLink} to="add" startIcon={<Iconify icon="eva:plus-fill" />}>
            New Meal
          </Button>
        </Stack>

        <Card>
          <UserListToolbar
            numSelected={selected.length}
            filterName={filterName}
            onFilterName={handleFilterByName}
            placeholder="search meal..."
          />
          {isLoading && (
            <Box sx={{ width: '100%', marginTop: 4 }}>
              <LinearProgress />
            </Box>
          )}
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
          {isError && (
            <Typography gutterBottom align="center" variant="subtitle1">
              An Error occured! Please refresh the page
            </Typography>
          )}
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={pageData.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredMeals.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const {
                      _id,
                      id,
                      imageURL,
                      nameEN,
                      nameAR,
                      category,
                      isAvailable,
                      currency,
                      price,
                      isSubscription,
                      isShuwaikh,
                      isFitness,
                      isSizeRequired,
                      sizes,
                    } = row;
                    const isItemSelected = selected.indexOf(id) !== -1;

                    return (
                      <TableRow
                        hover
                        key={id}
                        tabIndex={-1}
                        role="checkbox"
                        selected={isItemSelected}
                        aria-checked={isItemSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, id)} />
                        </TableCell>
                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <CardMedia
                              component="img"
                              image={
                                imageURL ??
                                'https://t3.ftcdn.net/jpg/04/34/72/82/360_F_434728286_OWQQvAFoXZLdGHlObozsolNeuSxhpr84.jpg'
                              }
                              style={{
                                aspectRatio: '1/1',
                                maxHeight: 80,
                                maxWidth: 80,
                                objectFit: 'contain',
                                borderRadius: 8,
                                margin: 6,
                                borderWidth: 0,
                              }}
                            />
                          </Stack>
                        </TableCell>
                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              {nameEN}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="right">{nameAR}</TableCell>
                        <TableCell align="right">{category?.name?.en}</TableCell>
                        <TableCell align="left">{`${currency} ${price}`}</TableCell>
                        <TableCell align="left">
                          {isSizeRequired && (
                            <Stack direction="row" alignItems="space-between" spacing={2}>
                              {sizes.map(({ id, isAvailable, name }, index) =>
                                isAvailable ? (
                                  <Label key={id} variant="ghost" color={DefaultColors[index]}>
                                    {name?.en}
                                  </Label>
                                ) : (
                                  <></>
                                )
                              )}
                            </Stack>
                          )}
                        </TableCell>
                        {isAvailable ? (
                          <TableCell align="left">
                            {isShuwaikh && (
                              <Label variant="ghost" color={'info'}>
                                Shuwaikh
                              </Label>
                            )}
                            {isFitness && (
                              <Label variant="ghost" color={'success'}>
                                Fitness
                              </Label>
                            )}
                            {isSubscription && (
                              <Label variant="filled" color={'warning'}>
                                Subscription
                              </Label>
                            )}
                          </TableCell>
                        ) : (
                          <TableCell align="left" />
                        )}

                        <TableCell align="right">
                          <MoreMenu
                            onEdit={() => {
                              setEditId(_id);
                            }}
                            onDelete={() => {
                              setDeleteId(id);
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isMealNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50, pageData.length]}
            component="div"
            count={pageData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </Page>
  );
}
