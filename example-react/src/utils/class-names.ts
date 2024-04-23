/**
 * Combines string classNames with object based ones
 * If an attribute (className) in the object have a false value it doesn't append it to the main className string
 * @param classnames an array of strings or objects
 * @returns string
 */
export default (...classnames: any): string => {
  const classesList: string[] = [];

  [...classnames].forEach((cn) => {
    if (cn) {
      if (typeof cn === 'object') {
        Object.keys(cn as object).forEach((cnE) => {
          if (cn[cnE]) {
            classesList.push(cnE);
          }
        });
      } else if (typeof cn === 'string' && cn.trim() !== '') {
        classesList.push(cn);
      }
    }
  });

  return classesList.join(' ').trim();
};
