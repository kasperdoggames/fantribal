const createTimes = (minutesInterval = 5) => {
  const availableTimes = [];
  for (let minute = 60; minute <= 1440; minute += minutesInterval) {
    const currentHour = Math.floor(minute / 60);
    const currentMinute = Math.floor(
      minute - (currentHour > 0 ? currentHour * 60 : 0)
    );
    if (currentHour === 24) continue;
    const hour = `${currentHour}`.padStart(2, "0");
    const minutes = `${currentMinute}`.padStart(2, "0");
    availableTimes.push(`${hour}:${minutes}`);
  }
  return availableTimes;
};

const TimePicker = ({ onTimeChange }: any) => {
  return (
    <div>
      <label className="block mb-1 text-sm text-gray-900">Time</label>
      <select
        className="block w-full p-2 py-3 pr-8 font-semibold leading-tight text-gray-700 bg-gray-300 rounded appearance-none focus:outline-none focus:text-black md:text-basecursor-default focus:border-gray-400 focus:border focus:bg-gray-100 focus:shadow-none"
        onChange={onTimeChange}
      >
        {createTimes().map((timeOption, index) => (
          <option key={index} value={timeOption}>
            {timeOption}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimePicker;
