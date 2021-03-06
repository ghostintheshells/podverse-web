// TODO: this has no tests.

const
    {offsetDate, lastHour} = require('./util'),
    {queryGoogleApiData} = require('./services/googleapi/googleapi'),
    sqlEngineFactory = require('./repositories/sequelize/engineFactory'),
    {isValidPageViewTimeRange} = require('./constants'),
    {dbConfig} = require('./config');

const sqlEngine = new sqlEngineFactory(dbConfig);

// Retrieves the unique pageview counts for the specified page path.
// Possible pagePaths: '~/podcasts' or '~/episodes' or '~/clips'
function queryUniquePageviews(pagePath, timeRange, startIndexOffset=0) {

  // This seems dangerous because it could get into an infinite loop. But the
  // increasing startIndexOffset should eventually result in data.rows.count
  // returning 0. TODO: is there a better way to do this?
  let startDateOffset; // in minutes

  if (pagePath != '~/podcasts' && pagePath != '~/episodes' && pagePath != '~/clips') {
    console.log('A valid pagePath must be provided in the first parameter.');
    console.log('Valid options are: ~/podcasts, ~/episodes, ~/clips');
  }

  if (timeRange === 'pastHourTotalUniquePageviews') {
    startDateOffset = -60;
  } else if (timeRange === 'pastDayTotalUniquePageviews') {
    startDateOffset = -1440;
  } else if (timeRange === 'pastWeekTotalUniquePageviews') {
    startDateOffset = -10080;
  } else if (timeRange === 'pastMonthTotalUniquePageviews') {
    startDateOffset = -43800;
  } else if (timeRange === 'pastYearTotalUniquePageviews') {
    startDateOffset = -525600;
  } else if (timeRange === 'allTimeTotalUniquePageviews') {
    // logic handled when the startDate variable is created
  } else {
    console.log('A valid timeRange must be provided in the second parameter.');
    console.log('Valid options are: pastHourTotalUniquePageviews, pastDayTotalUniquePageviews, pastWeekTotalUniquePageviews, pastMonthTotalUniquePageviews, pastYearTotalUniquePageviews, allTimeTotalUniquePageviews');
    return;
  }

  // startDate and endDate must be in yyyy-mm-dd string format
  let startDate = timeRange === 'allTimeTotalUniquePageviews' ? '2017-01-01' : offsetDate(startDateOffset);
  let hourFilter = timeRange === 'pastHourTotalUniquePageviews' ? `ga:hour==${lastHour()};` : '';

  let queryObj = {
    metrics: 'ga:uniquePageviews',
    dimensions: ['ga:pagePath', 'ga:date'],
    startDate: startDate,
    endDate: offsetDate(),
    sort: '-ga:uniquePageviews',
    maxResults: 10000, // maximum Google's API allows is 10000,
    startIndex: startIndexOffset || 1,
    filters: `ga:pagePath=${pagePath};${hourFilter}ga:uniquePageviews>0`
  };

  new Promise((resolve, reject) => {
    queryGoogleApiData(resolve, reject, queryObj);
  })
  .then(data => {

    let idArray = [];
    let rows = data.rows || [];

    for (i = 0; i < rows.length; i++) {
      let row = rows[i];
      const pathName = row.dimensions[0];
      if (pathName.indexOf('login-redirect') > -1) {
        continue;
      }

      // use this to chop off all of the path before the id
      // sample fields in row[0]: '/episodes/1234abc' '/clips/2345def' '/podcasts/3456ghi'
      let idStartIndex = pathName.indexOf('s/') + 2;
      row.dimensions[0] = pathName.substr(idStartIndex);
      idArray.push(row);
    }

    if (pagePath === '~/podcasts') {

      updateBatchUniquePageviewCount('podcasts', timeRange, idArray)
      .then(() => {
        queryForMoreIfMaxResultsReturned(data, timeRange, pagePath, startIndexOffset);
      })
      .catch(err => console.log(err));

    } else if (pagePath === '~/episodes') {

      updateBatchUniquePageviewCount('episodes', timeRange, idArray)
      .then(() => {
        queryForMoreIfMaxResultsReturned(data, timeRange, pagePath, startIndexOffset);
      })
      .catch(err => console.log(err));

    } else if (pagePath === '~/clips') {

      updateBatchUniquePageviewCount('mediaRefs', timeRange, idArray)
      .then(() => {
        queryForMoreIfMaxResultsReturned(data, timeRange, pagePath, startIndexOffset);
      })
      .catch(err => console.log(err));

    } else {
      console.log(`Invalid pagePath '${pagePath}' provided.`);
      console.log('Valid pagePaths include: ~/podcasts, ~/episodes, ~/clips');
    }

  })
  .catch(err => console.log(err));

}

function queryForMoreIfMaxResultsReturned(data, timeRange, pagePath, startIndexOffset) {
  // if (data.rows && data.rows.length === 10000) {
  //   queryUniquePageviews(timeRange, pagePath, (parseInt(startIndexOffset) + 10000))
  // }
}

function updateBatchUniquePageviewCount (type, timeRange, rows) {

  if (type !== 'podcasts' && type !== 'episodes' && type !== 'mediaRefs') {
    console.log('invalid table type provided');
    return;
  }

  if (!isValidPageViewTimeRange(timeRange)) {
    console.log('invalid timeRange provided');
    return;
  }

  let rawQuery = '';

  for (i = 0; i < rows.length; i++) {
    let row = rows[i];
    rawQuery += `UPDATE "${type}" SET "${timeRange}"=${row.metrics[0].values[0]} WHERE id='${row.dimensions[0]}';`;
  }

  return sqlEngine.query(rawQuery, {
    type: sqlEngine.QueryTypes.SELECT
  });
}

module.exports = {
  queryUniquePageviews
};
