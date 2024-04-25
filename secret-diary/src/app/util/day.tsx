import { GetServerSideProps } from "next";

export type DayProps = {
  year: number;
  month: number;
  date: number;
};

export const getServerSideProps: GetServerSideProps<DayProps> = async () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const date = today.getDate();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const blanks = Array(firstDay).fill(null);
  const issueMap = new Map();

  

  return {
    props: {
      year,
      month,
      date,
    },
  };
};

export default function Day(props: DayProps) {
  //내 생각엔 여기서 issue Mapping까지 시켜서 클라이언트로 보내줘야 할듯
  return (
    <div>
      {props.year}년 {props.month}월 {props.date}일
    </div>
  );
}