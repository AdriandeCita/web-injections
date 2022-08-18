/**
 * Example route: https://app.sunsama.com/group/mygroup
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
      const timeComponents =  timeString.indexOf(':') >= 0 ? timeString.split(':') : [timeString, '00']

      const [hours, minutes] = timeComponents.map((num) => parseInt(num));
  
      if (hours === 12) {
        return `${0}:${minutes}`;
      } else {
        return `${hours}:${minutes}`;
      }
    };
  
    const toMinutes = (timeString) => {
      const timeComponents =  timeString.indexOf(':') >= 0 ? timeString.split(':') : [timeString, '00']
      const [hours, minutes] = timeComponents.map((num) => parseInt(num));

      return hours * 60 + minutes;
    };
  
    const currentYearHolder = document.querySelector('.group-page-nav .nav-date');

    const dateContainer = document.querySelector('.calendar-view-day-container .calendar-view-dotm-label');
    const currentDayDate = new Date(
      Date.parse(`${dateContainer.textContent} ${currentYearHolder.textContent}`)
    );
  
    const plannerWrapper = document.querySelector('[class*="calendar-view-hours-inner-container"]');
    const plannerDayWrappers = plannerWrapper.querySelectorAll('[class*="calendar-view-day-container"]')
    if (plannerDayWrappers.length > 1) {
      return 'Multiple days selected, aborting...'
    }

    const plannerDay = plannerDayWrappers[0]
    const notableEvents = Array.from(plannerDay.querySelectorAll(
      '[class*="calendar-view-event-item-group"]'
    ));

    notableEvents.sort((nodeA, nodeB) => {
      const posA = parseInt(getComputedStyle(nodeA, null)['top'])
      const posB = parseInt(getComputedStyle(nodeB, null)['top'])

      return (posA || 0) - (posB || 0)
    })

    const workEntries = new (function() {
      const _data = {};
      const add = (title, minutesSpent, date) => {
        if (!_data[title]) {
          _data[title] = {
            minutesSpent,
            date,
            title,
          }
        } else {
          _data[title].minutesSpent += minutesSpent
        }
      } 

      const serialize = () => {
        const rows = Object.values(_data).map(({minutesSpent, date, title}) => ([
          '',
          date,
          '23',
          '37', // project id: 37,14?
          `"${title}"`, // make sure commas in the title won't mess things up
          `${minutesSpent / 60}`,
        ].join(',')));

        return `id,date,employee_id/.id,project_id/.id,name,unit_amount\n${rows.join("\n")}`
      } 
      return {
        add,
        serialize,
      }
    })();

    notableEvents.forEach((eventWrapper) => {
      const timeContainer = eventWrapper.querySelector('[class*="calendar-view-event-item-date"]');
      const titleContainer = eventWrapper.querySelector(
        '[class*="calendar-view-event-item-title-text"]'
      );
  
      if (timeContainer) {
        const [fromTime, toTime] = timeContainer.textContent
          .split(/\s*-\s*/)
          .map(normalizeHours);
        let minutesSpent = toMinutes(toTime) - toMinutes(fromTime);
        if (minutesSpent < 0) {
          minutesSpent += 12*60 // Normalize interval around 12PM
        }

        workEntries.add(titleContainer.textContent, minutesSpent, `${
          currentDayDate.getMonth() + 1
        }/${currentDayDate.getDate()}/${currentDayDate.getFullYear()}`)
      }
    });
  
    return workEntries.serialize();
  }
  