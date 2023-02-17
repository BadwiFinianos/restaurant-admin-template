import PropTypes from 'prop-types';
// material
import { Grid } from '@mui/material';
import CategoryCard from './CategoryCard';

// ----------------------------------------------------------------------

CategoriesList.propTypes = {
  categories: PropTypes.array,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

CategoriesList.defaultProps = {
  categories: [],
};

export default function CategoriesList({ categories, onEdit, onDelete, ...other }) {
  return (
    <Grid container spacing={3} {...other}>
      {categories?.map((category) => (
        <Grid key={category.id} item xs={12} sm={3} md={3}>
          <CategoryCard
            category={category}
            onEdit={() => {
              onEdit(category._id);
            }}
            onDelete={() => {
              onDelete(category.id);
            }}
          />
        </Grid>
      ))}
    </Grid>
  );
}
