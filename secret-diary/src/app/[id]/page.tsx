'use client';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import React, { useRef, useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import moment from 'moment-timezone';
import { usePathname } from 'next/navigation';//이렇게 하는게 정녕 맞나?
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import Image from 'next/image';

//진 짜 개 못알아보겟으니까 100줄이상넘어가면 어케좀해라 코드꼬라지좀 이거 난독화인가요??? 

import  Day  from '../util/day'; // Import the 'DayProps' type from the correct location
//위에 저거 없애야될거같음
interface DayProps {
  year: number;
  month: number;
  date: number;
}

interface CalendarAppProps {
  dayProps: DayProps;
  id: string;
}

// export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext ) => {
//   let id = 0;
//   if(context.params){
//     let id = context.params.id; // Access the 'id' from the URL
//   }

//     // Generate your DayProps here. This is just an example.
//     const dayProps: DayProps = {
//       year: new Date().getFullYear(),
//       month: new Date().getMonth() + 1,
//       date: new Date().getDate(),
//     };

//     // Pass 'dayProps' and 'id' to your component
//     return { props: { dayProps, id } };
// };

const CalendarApp: React.FC<{}> = () => { // Use the 'DayProps' type as the type for the 'props' parameter
  const [issues, setIssues] = useState<any[]>([]);
  //////
  // const [currentMonth, setCurrentMonth] = useState(new Date(props.year, props.month - 1, props.date));
  //////
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const id = usePathname();
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>();
  const calendarRef = useRef<HTMLDivElement>(null);
  const [calendarWidth, setCalendarWidth] = useState(0);
  // const [vh, setVh] = useState(0);
  // useEffect(() => {
  //   setVh(window.innerHeight * 0.01);
  // }, []);
  // const topConstraint = 5 * vh;
  // const bottomConstraint = 50 * vh;

  

  const handlers = useSwipeable({
    onSwipedLeft: () => handleSwipeLeft(),
    onSwipedRight: () => handleSwipeRight(),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true
  });

  const handleSwipeLeft = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  const handleSwipeRight = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDayClick = (issue: any) => {
    const markdownWithImages = convertImgTagsToMarkdown(issue.body);
    setSelectedDay(markdownWithImages);
    console.log(markdownWithImages);
    setIsBottomSheetVisible(true);
  }

  const githubIssueList = async (id: String) => {
    try {
      const github = id.substring(1);
      const header = {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`
      };
      const response = await fetch(`https://api.github.com/repos/${github}/issue-diary-${github}/issues?per_page=100`, { headers: header });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('An error occurred in the async function', error);
    }
  };


  useEffect(() => {
    githubIssueList(id);
  }, [id]);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const data = await githubIssueList(id);
        setIssues(data);
      } catch (error) {
        console.error('An error occurred while fetching issues', error);
      }
    };

    fetchIssues();
  }, [id]);

  useEffect(() => {
    if (calendarRef.current) {
      setCalendarWidth(calendarRef.current.offsetWidth);
    }
  }, []);

  function convertImgTagsToMarkdown(text: string) {
    const imgTagRegex = /<img.*?alt="([^"]*)".*?src="([^"]*)".*?>/g;
    return text.replace(imgTagRegex, (match: string, alt: string, src: string) => `![image](${src})`);
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const blanks = Array(firstDay).fill(null);
    // Create a map of issues by date
    const issueMap = new Map();
    issues.forEach(issue => {
      const createdAt = moment(issue.created_at).tz('Asia/Seoul').format().split('T')[0];
      issueMap.set(createdAt, issue);
    });

    const days = Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = moment.tz([year, month, day], 'Asia/Seoul').format('YYYY-MM-DD'); //잘 이해가 안되네 그냥 Y-M-D로 concat하면 안되나? 왜 여기서 tz이 필요하지? 

      // Find the issue for the date from the map
      const issue = issueMap.get(date);

      return issue ? (
        <div
          className="text-center py-1 flex flex-col items-center justify-center"
          onClick={() => handleDayClick(issue)}
        >
          <span>{issue.title}</span>
          <div className="text-xs text-center">{day}</div>
        </div>
      ) : (
        <div
          className="text-center py-1 flex flex-col items-center justify-center"
          onClick={() => handleDayClick('empty!')}
        ><span style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}></span>
          <div className="text-xs text-center">{day}</div>
        </div>)
    });

    return (
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '0 20px' }} ref={calendarRef}>
        <div className="grid grid-cols-7 gap-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div style={{ fontSize: '10px', textAlign: 'center', padding: '5px 0' }} key={index}>
              <span>{day}</span>
            </div>
          ))}
        </div>
        <br />
        <div className="grid grid-cols-7 gap-2 text-center">
          {blanks.map((_, index) => (
            <div className="text-center py-1" key={`blank-${index}`}>
              <span></span>
            </div>
          ))}
          {days.map((day, index) => (
            <div
              key={index}
            >
              <span>{day}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen max-w-s mx-auto p-5">
      <div className="flex items-center justify-center h-1/5 overflow-auto text-center">
        <Image
                src="/issue-black.png"
                alt="black issue logo"
                className="dark:invert"
                width={100}
                height={24}
                priority
              />
      </div>
      <div className="h-3/5 overflow-auto">
        {renderCalendar()}
      </div>
      <div className="h-1/10 grid grid-cols-2 max-w-s mx-auto gap-2">
        <button className="py-2 text-center" onClick={handleSwipeRight}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
  <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
</svg>
</button>
        <button className="py-2 text-center" onClick={handleSwipeLeft}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
  <path fillRule="evenodd" d="M16.28 11.47a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 0 1-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 0 1 1.06-1.06l7.5 7.5Z" clipRule="evenodd" />
</svg>
</button>
      </div>
      <div className="h-1/10">
        <p className="text-center">{currentMonth.toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</p>
      </div>
      <div>
        <Day year={currentMonth.getFullYear()} month={currentMonth.getMonth() + 1} date={currentMonth.getDate()} />
      </div>
      {isBottomSheetVisible && (
        <>
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setIsBottomSheetVisible(false)}></div>
          <div
            className="fixed mx-auto bottom-0 left-0 right-0 bg-white p-4 rounded-t-lg shadow-lg overflow-auto"
            style={{ width: `${calendarWidth}px`, height: `80vh` }}
          >
            <button onClick={() => setIsBottomSheetVisible(false)}>Close</button>
            <div className="prose prose-sm"><ReactMarkdown>{selectedDay}</ReactMarkdown></div>
            {/* ref:https://stackoverflow.com/questions/75706164/problem-with-tailwind-css-when-using-the-react-markdown-component */}
          </div>
        </>
      )}
    </div>
  );
};

//마크다운 이미지를 보여줄 때에는 두 가지 방법이 있는데
///reactmarkdown에서 allowdangerousehtml을 참으로 놓거나, 직접 파싱해주면 된다
//그런데 allowdangerousehtml을 허용하면 XSS 스크립팅 공격에 취약해질수있다. 
//그래서 <img>를 직접 파싱해서 ![image]로 바꿔준다.
//하지만 깃헙도 <img>를 쓰는 이유가 있었으니 ![image]는 이미지 너비를 설정할 수 없다.
//그래서 둘 다를 해결하려면 (1)reactmarkdown 내부를 파고들거나 아니면 (2)마크다운파서를 새로 만들거나 (3)그냥 XSS스크립팅을 허용해주거나 (4)그냥 이미지 너비 설정하지 말던가 해야한다. 
//나는 4번을 골랐다. ㅎ

export default CalendarApp;

