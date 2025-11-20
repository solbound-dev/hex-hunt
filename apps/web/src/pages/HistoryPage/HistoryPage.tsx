import { useGetHistoryForGame } from '../../api/history/useGetHistoryForGame';

const HistoryPage = () => {
  const { data: gameHistory } = useGetHistoryForGame(
    'bf907eac-3be4-4f63-b716-858c9a69933d',
  );

  console.log(gameHistory);

  return <div>{JSON.stringify(gameHistory)}</div>;
};

export default HistoryPage;
