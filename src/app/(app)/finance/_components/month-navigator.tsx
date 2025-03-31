import { startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns"

const [currentMonthDate, setCurrentMonthDate] = useState(new Date())

useEffect(() => {
  const start = startOfMonth(currentMonthDate)
  const end = endOfMonth(currentMonthDate)
  // Rest of your code
}, [currentMonthDate])
