import moment from 'moment';

export const updateObject = (oldObject, updatedProperties) => {
  return {
    ...oldObject,
    ...updatedProperties
  };
};
export const formatNumber = (number) => {
  if(number>1000) 
    return Math.floor(parseInt(number/1000)) + 'K'
  return number
}

export const getDefaultDateRange = () => {
  const from = moment(new Date()).add(-3, 'days').format('YYYY-MM-DD');
  const to = moment(new Date()).format('YYYY-MM-DD');
  return [from, to];
}

export const formatDefaultDate = (date, format='L') => {
  return moment(date).format(format);
}

export const formatDate = (date, format='ll') => {
  return moment(date).format(format)
}

export const getPropertyValue = (searchObject = {}, targetProperty) => {
  const match = searchObject[targetProperty];
  const children = searchObject?.children;
  if (match) return match;
  if (children) {
    //traditional for-loop to end the loop if valid value returned
    for (let i = 0; i < children.length; i++) {
      const nestedTargetProperty = children[i][targetProperty];
      if (nestedTargetProperty) return nestedTargetProperty;

      const childrenTargetProperty = getPropertyValue(
        children[i], 
        targetProperty
      );
      if (childrenTargetProperty) return childrenTargetProperty;
    }
  }
  return null;
}

export const filterNodesByProperty = (layers, params = {}) => {
  //params are key/value pairs of target properties and their
  //values to be searched, such as: { domain: 'Weather' }
  const paramsEntries = Object.entries(params);

  //if all filters are inactive, return all layers
  if (paramsEntries.every(([key]) => !params[key])) return layers;

  return layers?.filter((parent) => 
    paramsEntries.every(([targetProperty, matchValue]) => {
      //if some filters are inactive, ignore, as that means they're not applied
      if (!matchValue) return true;

      const targetPropertyValue = getPropertyValue(parent, targetProperty);
      return targetPropertyValue === matchValue;
    })
  )
}
