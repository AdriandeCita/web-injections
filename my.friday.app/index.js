/**
 * Example route: https://my.friday.app/planner/03/02/2022
 * 
 * Looks into the page timeline, picks time blocks from it and generates list
 * oftheir respective entries in CSV. The out put contains three columns,
 * namely:
 * 
 * - date in format "DD/MM/YYYY"
 * - name of the activity
 * - hours taken by the activity (in decimal format)
 * 
 * For example:
 * > date,name,unit_amount
 * > 2/3/2022,Adding source hostname to the alerts in incident's details,1
 * > 2/3/2022,Digging into data framework, adding workaround to handle partially filled datasets,2
 * 
 * @returns CSV document in string format.
 */
function getDayInCsv() {
    const normalizeHours = (timeString) => {
      const [hours, minutes] = timeString.split(':').map((num) => parseInt(num));
  
      if (timeString.slice(-2) === 'am' && hours === 12) {
        return `${0}:${minutes}`;
      } else if (timeString.slice(-2) === 'pm' && hours !== 12) {
        return `${hours + 12}:${minutes}`;
      } else {
        return `${hours}:${minutes}`;
      }
    };
  
    const toMinutes = (timeString) => {
      const [hours, minutes] = timeString.split(':').map((num) => parseInt(num));
      return hours * 60 + minutes;
    };
  
    const currentYear = new Date().getFullYear();
    const dateContainer = document.querySelector('[class*="Section__HeaderTitle"]');
    const currentDayDate = new Date(
      Date.parse(`${dateContainer.firstChild.textContent} ${currentYear}`)
    );
  
    const plannerWrapper = document.querySelector('[class*="DropZone__Wrapper"]');
    const notableEvents = plannerWrapper.querySelectorAll(
      '[class*="Event__Wrapper"]'
    );
    let csv = 'date,name,unit_amount';
    Array.from(notableEvents).forEach((eventWrapper) => {
      const timeContainer = eventWrapper.querySelector('[class*="Event__Time"]');
      const titleContainer = eventWrapper.querySelector(
        '[class*="Event__Title"]'
      );
  
      if (timeContainer) {
        const [fromTime, toTime] = timeContainer.textContent
          .split(/\s*-\s*/)
          .map(normalizeHours);
        const minutesSpent = toMinutes(toTime) - toMinutes(fromTime);
        const row = [
          `${currentDayDate.getDate()}/${
            currentDayDate.getMonth() + 1
          }/${currentDayDate.getFullYear()}`,
          `${titleContainer.textContent}`,
          `${minutesSpent / 60}`,
        ].join(',');
        csv = `${csv}\n${row}`;
      } else {
        const row = [
          `${currentDayDate.getDate()}/${
            currentDayDate.getMonth() + 1
          }/${currentDayDate.getFullYear()}`,
          `${titleContainer.textContent}`,
          `???`,
        ].join(',');
        csv = `${csv}\n${row}`;
      }
    });
  
    return csv;
  }
  