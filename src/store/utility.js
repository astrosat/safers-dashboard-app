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

export const getPropertyValue = (nodeObject, matchString) => {
  const match = nodeObject[matchString];
  const children = nodeObject?.children;
  if (match) return match;
  if (children) {
    //traditional for-loop to end the loop if valid value returned
    for (let i = 0; i < children.length; i++) {
      const targetProperty = children[i][matchString];
      if (targetProperty) return targetProperty;

      const childrenTargetProperty = getPropertyValue(children[i], matchString);
      if (childrenTargetProperty) return childrenTargetProperty;
    }
  }
  return null;
}

export const filterNodesByProperty = (layers, params) => {
  //params are key/value pairs of target properties and their
  //values to be searched, such as: { domain: 'Weather' }
  const paramsEntries = Object.entries(params);

  //if all filters are inactive, return all layers
  if (paramsEntries.every(([_, value]) => !value)) return layers;

  return layers?.filter((parent) => 
    paramsEntries.every(([targetProperty, matchValue]) => {
      const targetValue = getPropertyValue(parent, targetProperty);
      return Boolean(targetValue === matchValue);
    })
  )
}
