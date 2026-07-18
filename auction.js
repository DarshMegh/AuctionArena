/* ===========================================================
   Auction Arena — core auction logic
   Uses real IPL 2026 team names and real, publicly known players
   for an unofficial fan-made auction simulation. Not affiliated
   with or endorsed by the BCCI or IPL. Ratings and base prices
   below are simplified numbers made up for this simulation's
   gameplay -- they are not official BCCI/IPL figures.
   Bid-increment rules, heuristic AI bot bidders, team validation,
   and a Best XI picker. All pure functions -- no DOM, fully
   unit-testable.
   =========================================================== */

const ROLES = ['Batsman', 'Bowler', 'All-rounder', 'Wicketkeeper'];

const REAL_TEAM_NAMES = [
  'Chennai Super Kings',
  'Mumbai Indians',
  'Royal Challengers Bengaluru',
  'Kolkata Knight Riders',
  'Rajasthan Royals',
  'Delhi Capitals',
  'Gujarat Titans',
  'Lucknow Super Giants',
  'Punjab Kings',
  'Sunrisers Hyderabad'
];

function makePlayer(id, name, role, tier, basePrice, rating, nationality, description) {
  return { id, name, role, tier, basePrice, rating, nationality, description, sold: false, soldTo: null, soldPrice: null };
}


const PLAYERS = [
  makePlayer(1, 'MS Dhoni', 'Wicketkeeper', 'Icon', 2.0, 94, 'Indian', "A legendary finisher and one of the game\'s sharpest tactical minds behind the stumps."),
  makePlayer(2, 'Ruturaj Gaikwad', 'Batsman', 'A', 1.51, 83, 'Indian', "A stylish opener known for effortless timing and calm, controlled aggression at the top of the order."),
  makePlayer(3, 'Sanju Samson', 'Wicketkeeper', 'A', 1.64, 85, 'Indian', "A wristy, attacking wicketkeeper-batsman capable of taking down any bowling attack on his day."),
  makePlayer(4, 'Ayush Mhatre', 'Batsman', 'C', 0.4, 68, 'Indian', "A dependable top-order batsman who values a solid base before looking to accelerate."),
  makePlayer(5, 'Dewald Brevis', 'Batsman', 'C', 0.63, 74, 'Overseas', "A middle-order batsman known for calm, composed innings under pressure."),
  makePlayer(6, 'Shivam Dube', 'All-rounder', 'B', 1.31, 81, 'Indian', "A genuine utility all-rounder who chips in with both bat and ball whenever called upon."),
  makePlayer(7, 'Urvil Patel', 'Wicketkeeper', 'C', 0.7, 76, 'Indian', "A tidy wicketkeeper-batsman who offers reliability behind the stumps and handy runs in the middle order."),
  makePlayer(8, 'Noor Ahmad', 'Bowler', 'B', 0.95, 78, 'Overseas', "A disciplined seam bowler who relies on consistent lines and lengths."),
  makePlayer(9, 'Nathan Ellis', 'Bowler', 'B', 1.15, 80, 'Overseas', "A promising pace option capable of hitting good areas under pressure."),
  makePlayer(10, 'Shreyas Gopal', 'Bowler', 'C', 0.31, 66, 'Indian', "A crafty spinner who uses flight and variation to trouble batsmen in the middle overs."),
  makePlayer(11, 'Khaleel Ahmed', 'Bowler', 'B', 1.03, 78, 'Indian', "A raw-pace bowler still sharpening his control but always a live wicket-taking threat."),
  makePlayer(12, 'Ramakrishna Ghosh', 'Bowler', 'C', 0.53, 72, 'Indian', "A death-overs specialist who backs his yorkers and slower balls in the closing stages."),
  makePlayer(13, 'Mukesh Choudhary', 'Bowler', 'C', 0.31, 66, 'Indian', "A new-ball bowler who looks to make early inroads with movement off the seam."),
  makePlayer(14, 'Jamie Overton', 'All-rounder', 'C', 0.39, 68, 'Overseas', "A lower-order hitter who also offers a handy over or two of medium pace."),
  makePlayer(15, 'Gurjapneet Singh', 'Bowler', 'C', 0.59, 73, 'Indian', "A disciplined seam bowler who relies on consistent lines and lengths."),
  makePlayer(16, 'Anshul Kamboj', 'Bowler', 'C', 0.55, 72, 'Indian', "A promising pace option capable of hitting good areas under pressure."),
  makePlayer(17, 'Prashant Veer', 'Batsman', 'C', 0.4, 68, 'Indian', "An aggressive strokeplayer who looks to seize the initiative early in the innings."),
  makePlayer(18, 'Kartik Sharma', 'Batsman', 'C', 0.57, 72, 'Indian', "A gritty opener who prefers to see off the new ball before cutting loose."),
  makePlayer(19, 'Rahul Chahar', 'Bowler', 'C', 0.66, 75, 'Indian', "A crafty spinner who uses flight and variation to trouble batsmen in the middle overs."),
  makePlayer(20, 'Akeal Hosein', 'Bowler', 'C', 0.3, 66, 'Overseas', "A raw-pace bowler still sharpening his control but always a live wicket-taking threat."),
  makePlayer(21, 'Matt Henry', 'Bowler', 'B', 1.38, 82, 'Overseas', "A death-overs specialist who backs his yorkers and slower balls in the closing stages."),
  makePlayer(22, 'Matthew Short', 'All-rounder', 'C', 0.61, 74, 'Overseas', "An all-rounder in the making, valued for his fielding and his willingness to contribute in every discipline."),
  makePlayer(23, 'Sarfaraz Khan', 'Batsman', 'C', 0.45, 70, 'Indian', "A young batting talent building a growing reputation for clean, positive hitting."),
  makePlayer(24, 'Zak Foulkes', 'Bowler', 'C', 0.37, 68, 'Overseas', "A new-ball bowler who looks to make early inroads with movement off the seam."),
  makePlayer(25, 'Aman Khan', 'All-rounder', 'C', 0.73, 77, 'Indian', "A canny finisher with the bat who can also turn his arm over in a pinch."),
  makePlayer(26, 'Nitish Rana', 'Batsman', 'B', 1.1, 79, 'Indian', "A busy accumulator of runs, adept at rotating strike and finding the gaps."),
  makePlayer(27, 'Abishek Porel', 'Wicketkeeper', 'C', 0.34, 67, 'Indian', "An attacking wicketkeeper-batsman who looks to counter-attack from the top of the order."),
  makePlayer(28, 'Ajay Mandal', 'All-rounder', 'C', 0.34, 67, 'Indian', "A hard-hitting all-rounder who provides balance lower down the order."),
  makePlayer(29, 'Ashutosh Sharma', 'Batsman', 'C', 0.68, 75, 'Indian', "A dependable top-order batsman who values a solid base before looking to accelerate."),
  makePlayer(30, 'Axar Patel', 'All-rounder', 'A', 1.8, 87, 'Indian', "An economical left-arm spinner who chips in with handy lower-order runs when needed."),
  makePlayer(31, 'Dushmantha Chameera', 'Bowler', 'C', 0.66, 75, 'Overseas', "A disciplined seam bowler who relies on consistent lines and lengths."),
  makePlayer(32, 'Karun Nair', 'Batsman', 'B', 1.34, 81, 'Indian', "A middle-order batsman known for calm, composed innings under pressure."),
  makePlayer(33, 'KL Rahul', 'Wicketkeeper', 'A', 1.77, 86, 'Indian', "A technically sound opener capable of both anchoring an innings and accelerating late."),
  makePlayer(34, 'Kuldeep Yadav', 'Bowler', 'A', 1.99, 89, 'Indian', "A left-arm wrist-spinner whose variations make him a constant wicket-taking threat in the middle overs."),
  makePlayer(35, 'Madhav Tiwari', 'Bowler', 'C', 0.47, 70, 'Indian', "A promising pace option capable of hitting good areas under pressure."),
  makePlayer(36, 'Mitchell Starc', 'Bowler', 'A', 1.78, 86, 'Overseas', "A left-arm pace spearhead who swings the new ball and hits the deck hard with the old one."),
  makePlayer(37, 'Sameer Rizvi', 'Batsman', 'C', 0.67, 75, 'Indian', "An aggressive strokeplayer who looks to seize the initiative early in the innings."),
  makePlayer(38, 'T Natarajan', 'Bowler', 'B', 1.27, 81, 'Indian', "A crafty spinner who uses flight and variation to trouble batsmen in the middle overs."),
  makePlayer(39, 'Tripurana Vijay', 'Batsman', 'C', 0.69, 75, 'Indian', "A gritty opener who prefers to see off the new ball before cutting loose."),
  makePlayer(40, 'Tristan Stubbs', 'Batsman', 'B', 1.25, 80, 'Overseas', "A young batting talent building a growing reputation for clean, positive hitting."),
  makePlayer(41, 'Vipraj Nigam', 'All-rounder', 'C', 0.62, 74, 'Indian', "A genuine utility all-rounder who chips in with both bat and ball whenever called upon."),
  makePlayer(42, 'Mukesh Kumar', 'Bowler', 'C', 0.32, 67, 'Indian', "A raw-pace bowler still sharpening his control but always a live wicket-taking threat."),
  makePlayer(43, 'Auqib Nabi', 'Bowler', 'C', 0.4, 69, 'Indian', "A death-overs specialist who backs his yorkers and slower balls in the closing stages."),
  makePlayer(44, 'Pathum Nissanka', 'Batsman', 'B', 1.07, 79, 'Overseas', "A busy accumulator of runs, adept at rotating strike and finding the gaps."),
  makePlayer(45, 'David Miller', 'Batsman', 'B', 0.95, 77, 'Overseas', "A dependable top-order batsman who values a solid base before looking to accelerate."),
  makePlayer(46, 'Ben Duckett', 'Batsman', 'B', 1.04, 78, 'Overseas', "A middle-order batsman known for calm, composed innings under pressure."),
  makePlayer(47, 'Lungi Ngidi', 'Bowler', 'C', 0.35, 67, 'Overseas', "A new-ball bowler who looks to make early inroads with movement off the seam."),
  makePlayer(48, 'Kyle Jamieson', 'Bowler', 'C', 0.43, 69, 'Overseas', "A disciplined seam bowler who relies on consistent lines and lengths."),
  makePlayer(49, 'Prithvi Shaw', 'Batsman', 'C', 0.59, 73, 'Indian', "An aggressive strokeplayer who looks to seize the initiative early in the innings."),
  makePlayer(50, 'Sahil Parikh', 'Batsman', 'C', 0.46, 70, 'Indian', "A gritty opener who prefers to see off the new ball before cutting loose."),
  makePlayer(51, 'Anuj Rawat', 'Wicketkeeper', 'C', 0.47, 70, 'Indian', "A promising young gloveman with a compact technique against both pace and spin."),
  makePlayer(52, 'Glenn Phillips', 'Wicketkeeper', 'B', 1.03, 78, 'Overseas', "A tidy wicketkeeper-batsman who offers reliability behind the stumps and handy runs in the middle order."),
  makePlayer(53, 'Gurnoor Brar', 'Bowler', 'C', 0.42, 69, 'Indian', "A promising pace option capable of hitting good areas under pressure."),
  makePlayer(54, 'Ishant Sharma', 'Bowler', 'C', 0.72, 76, 'Indian', "A crafty spinner who uses flight and variation to trouble batsmen in the middle overs."),
  makePlayer(55, 'Jayant Yadav', 'All-rounder', 'C', 0.59, 73, 'Indian', "A lower-order hitter who also offers a handy over or two of medium pace."),
  makePlayer(56, 'Jos Buttler', 'Wicketkeeper', 'A', 1.8, 87, 'Overseas', "An explosive wicketkeeper-batsman with a knack for taking games away in the powerplay."),
  makePlayer(57, 'Kagiso Rabada', 'Bowler', 'A', 1.59, 84, 'Overseas', "A world-class fast bowler with pace, seam movement, and a knack for early breakthroughs."),
  makePlayer(58, 'Kumar Kushagra', 'Wicketkeeper', 'C', 0.63, 74, 'Indian', "An attacking wicketkeeper-batsman who looks to counter-attack from the top of the order."),
  makePlayer(59, 'Manav Suthar', 'Bowler', 'C', 0.37, 68, 'Indian', "A raw-pace bowler still sharpening his control but always a live wicket-taking threat."),
  makePlayer(60, 'Mohammed Siraj', 'Bowler', 'A', 1.69, 85, 'Indian', "A high-energy new-ball bowler whose pace and aggression set the tone with the first over."),
  makePlayer(61, 'Arshad Khan', 'All-rounder', 'C', 0.75, 77, 'Indian', "An all-rounder in the making, valued for his fielding and his willingness to contribute in every discipline."),
  makePlayer(62, 'Nishant Sindhu', 'All-rounder', 'C', 0.59, 73, 'Indian', "A canny finisher with the bat who can also turn his arm over in a pinch."),
  makePlayer(63, 'Prasidh Krishna', 'Bowler', 'B', 1.23, 80, 'Indian', "A death-overs specialist who backs his yorkers and slower balls in the closing stages."),
  makePlayer(64, 'R Sai Kishore', 'Bowler', 'C', 0.61, 74, 'Indian', "A new-ball bowler who looks to make early inroads with movement off the seam."),
  makePlayer(65, 'Rahul Tewatia', 'All-rounder', 'C', 0.68, 75, 'Indian', "A hard-hitting all-rounder who provides balance lower down the order."),
  makePlayer(66, 'Rashid Khan', 'Bowler', 'A', 1.89, 88, 'Overseas', "A world-class leg-spinner whose pace and control through the air make him nearly unreadable."),
  makePlayer(67, 'B Sai Sudharsan', 'Batsman', 'B', 1.04, 78, 'Indian', "A young batting talent building a growing reputation for clean, positive hitting."),
  makePlayer(68, 'M Shahrukh Khan', 'Batsman', 'C', 0.31, 66, 'Indian', "A busy accumulator of runs, adept at rotating strike and finding the gaps."),
  makePlayer(69, 'Shubman Gill', 'Batsman', 'Icon', 2.0, 92, 'Indian', "A classical top-order batsman blending textbook technique with the ability to accelerate at will."),
  makePlayer(70, 'Washington Sundar', 'All-rounder', 'B', 1.06, 79, 'Indian', "A genuine utility all-rounder who chips in with both bat and ball whenever called upon."),
  makePlayer(71, 'Jason Holder', 'All-rounder', 'B', 1.03, 78, 'Overseas', "A lower-order hitter who also offers a handy over or two of medium pace."),
  makePlayer(72, 'Tom Banton', 'Batsman', 'C', 0.72, 76, 'Overseas', "A dependable top-order batsman who values a solid base before looking to accelerate."),
  makePlayer(73, 'Ashok Sharma', 'Bowler', 'C', 0.69, 76, 'Indian', "A disciplined seam bowler who relies on consistent lines and lengths."),
  makePlayer(74, 'Luke Wood', 'Bowler', 'C', 0.44, 69, 'Overseas', "A promising pace option capable of hitting good areas under pressure."),
  makePlayer(75, 'Prithvi Raj', 'Bowler', 'C', 0.59, 73, 'Indian', "A crafty spinner who uses flight and variation to trouble batsmen in the middle overs."),
  makePlayer(76, 'Ajinkya Rahane', 'Batsman', 'B', 1.14, 79, 'Indian', "A middle-order batsman known for calm, composed innings under pressure."),
  makePlayer(77, 'Angkrish Raghuvanshi', 'Batsman', 'C', 0.71, 76, 'Indian', "An aggressive strokeplayer who looks to seize the initiative early in the innings."),
  makePlayer(78, 'Anukul Roy', 'All-rounder', 'C', 0.51, 71, 'Indian', "An all-rounder in the making, valued for his fielding and his willingness to contribute in every discipline."),
  makePlayer(79, 'Harshit Rana', 'Bowler', 'B', 1.06, 79, 'Indian', "A raw-pace bowler still sharpening his control but always a live wicket-taking threat."),
  makePlayer(80, 'Manish Pandey', 'Batsman', 'C', 0.41, 69, 'Indian', "A gritty opener who prefers to see off the new ball before cutting loose."),
  makePlayer(81, 'Ramandeep Singh', 'All-rounder', 'C', 0.55, 72, 'Indian', "A canny finisher with the bat who can also turn his arm over in a pinch."),
  makePlayer(82, 'Rinku Singh', 'Batsman', 'B', 1.06, 79, 'Indian', "A young batting talent building a growing reputation for clean, positive hitting."),
  makePlayer(83, 'Rovman Powell', 'Batsman', 'B', 1.25, 81, 'Overseas', "A busy accumulator of runs, adept at rotating strike and finding the gaps."),
  makePlayer(84, 'Sunil Narine', 'All-rounder', 'A', 1.95, 88, 'Overseas', "A mystery spinner who doubles as an explosive pinch-hitting opener -- a genuine two-way matchwinner."),
  makePlayer(85, 'Umran Malik', 'Bowler', 'C', 0.48, 70, 'Indian', "A death-overs specialist who backs his yorkers and slower balls in the closing stages."),
  makePlayer(86, 'Vaibhav Arora', 'Bowler', 'C', 0.4, 68, 'Indian', "A new-ball bowler who looks to make early inroads with movement off the seam."),
  makePlayer(87, 'Varun Chakravarthy', 'Bowler', 'B', 1.5, 83, 'Indian', "A disciplined seam bowler who relies on consistent lines and lengths."),
  makePlayer(88, 'Cameron Green', 'All-rounder', 'A', 1.75, 86, 'Overseas', "A tall, powerful all-rounder who provides genuine pace with the ball and clean hitting with the bat."),
  makePlayer(89, 'Mustafizur Rahman', 'Bowler', 'B', 0.95, 78, 'Overseas', "A promising pace option capable of hitting good areas under pressure."),
  makePlayer(90, 'Matheesha Pathirana', 'Bowler', 'A', 1.52, 83, 'Overseas', "A slinging fast bowler whose unusual action and yorkers make him a handful at the death."),
  makePlayer(91, 'Tejasvi Singh', 'All-rounder', 'C', 0.35, 67, 'Indian', "A hard-hitting all-rounder who provides balance lower down the order."),
  makePlayer(92, 'Finn Allen', 'Batsman', 'C', 0.58, 73, 'Overseas', "A dependable top-order batsman who values a solid base before looking to accelerate."),
  makePlayer(93, 'Rachin Ravindra', 'All-rounder', 'B', 1.38, 82, 'Overseas', "A genuine utility all-rounder who chips in with both bat and ball whenever called upon."),
  makePlayer(94, 'Tim Seifert', 'Wicketkeeper', 'C', 0.49, 71, 'Overseas', "A promising young gloveman with a compact technique against both pace and spin."),
  makePlayer(95, 'Akash Deep', 'Bowler', 'B', 0.94, 77, 'Indian', "A crafty spinner who uses flight and variation to trouble batsmen in the middle overs."),
  makePlayer(96, 'Rahul Tripathi', 'Batsman', 'C', 0.47, 70, 'Indian', "A middle-order batsman known for calm, composed innings under pressure."),
  makePlayer(97, 'Prashant Solanki', 'Bowler', 'C', 0.75, 77, 'Indian', "A raw-pace bowler still sharpening his control but always a live wicket-taking threat."),
  makePlayer(98, 'Kartik Tyagi', 'Bowler', 'C', 0.54, 72, 'Indian', "A death-overs specialist who backs his yorkers and slower balls in the closing stages."),
  makePlayer(99, 'Sarthak Ranjan', 'Batsman', 'C', 0.74, 77, 'Indian', "An aggressive strokeplayer who looks to seize the initiative early in the innings."),
  makePlayer(100, 'Daksh Kamra', 'Batsman', 'C', 0.69, 75, 'Indian', "A gritty opener who prefers to see off the new ball before cutting loose."),
  makePlayer(101, 'Abdul Samad', 'Batsman', 'C', 0.31, 66, 'Indian', "A young batting talent building a growing reputation for clean, positive hitting."),
  makePlayer(102, 'Aiden Markram', 'Batsman', 'B', 1.33, 81, 'Overseas', "A busy accumulator of runs, adept at rotating strike and finding the gaps."),
  makePlayer(103, 'Akash Singh', 'Bowler', 'C', 0.61, 73, 'Indian', "A new-ball bowler who looks to make early inroads with movement off the seam."),
  makePlayer(104, 'Arjun Tendulkar', 'Bowler', 'C', 0.54, 72, 'Indian', "A disciplined seam bowler who relies on consistent lines and lengths."),
  makePlayer(105, 'Arshin Kulkarni', 'All-rounder', 'C', 0.42, 69, 'Indian', "A lower-order hitter who also offers a handy over or two of medium pace."),
  makePlayer(106, 'Avesh Khan', 'Bowler', 'B', 1.28, 81, 'Indian', "A promising pace option capable of hitting good areas under pressure."),
  makePlayer(107, 'Ayush Badoni', 'Batsman', 'C', 0.35, 67, 'Indian', "A dependable top-order batsman who values a solid base before looking to accelerate."),
  makePlayer(108, 'Digvesh Rathi', 'Bowler', 'C', 0.5, 71, 'Indian', "A crafty spinner who uses flight and variation to trouble batsmen in the middle overs."),
  makePlayer(109, 'Himmat Singh', 'Batsman', 'C', 0.5, 71, 'Indian', "A middle-order batsman known for calm, composed innings under pressure."),
  makePlayer(110, 'Manimaran Siddharth', 'Bowler', 'C', 0.73, 76, 'Indian', "A raw-pace bowler still sharpening his control but always a live wicket-taking threat."),
  makePlayer(111, 'Matthew Breetzke', 'Batsman', 'C', 0.69, 76, 'Overseas', "An aggressive strokeplayer who looks to seize the initiative early in the innings."),
  makePlayer(112, 'Mayank Yadav', 'Bowler', 'B', 1.06, 79, 'Indian', "A death-overs specialist who backs his yorkers and slower balls in the closing stages."),
  makePlayer(113, 'Mohammed Shami', 'Bowler', 'A', 1.75, 86, 'Indian', "A new-ball specialist with disciplined lines and the ability to reverse the ball late in an innings."),
  makePlayer(114, 'Mitchell Marsh', 'All-rounder', 'B', 1.01, 78, 'Overseas', "An all-rounder in the making, valued for his fielding and his willingness to contribute in every discipline."),
  makePlayer(115, 'Mohsin Khan', 'Bowler', 'C', 0.71, 76, 'Indian', "A new-ball bowler who looks to make early inroads with movement off the seam."),
  makePlayer(116, 'Nicholas Pooran', 'Wicketkeeper', 'A', 1.94, 88, 'Overseas', "A destructive left-handed finisher capable of clearing the boundary with minimal backlift."),
  makePlayer(117, 'Prince Yadav', 'Bowler', 'C', 0.43, 69, 'Indian', "A disciplined seam bowler who relies on consistent lines and lengths."),
  makePlayer(118, 'Rishabh Pant', 'Wicketkeeper', 'Icon', 2.0, 94, 'Indian', "An aggressive left-handed batsman who can turn a game in a handful of overs with fearless strokeplay."),
  makePlayer(119, 'Shahbaz Ahmed', 'All-rounder', 'C', 0.57, 73, 'Indian', "A canny finisher with the bat who can also turn his arm over in a pinch."),
  makePlayer(120, 'Josh Inglis', 'Wicketkeeper', 'B', 0.99, 78, 'Overseas', "A tidy wicketkeeper-batsman who offers reliability behind the stumps and handy runs in the middle order."),
  makePlayer(121, 'Mukul Choudhary', 'Bowler', 'C', 0.64, 74, 'Indian', "A promising pace option capable of hitting good areas under pressure."),
  makePlayer(122, 'Akshat Raghuwanshi', 'Batsman', 'C', 0.54, 72, 'Indian', "A gritty opener who prefers to see off the new ball before cutting loose."),
  makePlayer(123, 'Wanindu Hasaranga', 'All-rounder', 'B', 1.37, 82, 'Overseas', "A hard-hitting all-rounder who provides balance lower down the order."),
  makePlayer(124, 'Anrich Nortje', 'Bowler', 'B', 1.22, 80, 'Overseas', "A crafty spinner who uses flight and variation to trouble batsmen in the middle overs."),
  makePlayer(125, 'Naman Tiwari', 'Bowler', 'C', 0.3, 66, 'Indian', "A raw-pace bowler still sharpening his control but always a live wicket-taking threat."),
  makePlayer(126, 'Shardul Thakur', 'All-rounder', 'B', 1.09, 79, 'Indian', "A genuine utility all-rounder who chips in with both bat and ball whenever called upon."),
  makePlayer(127, 'Sherfane Rutherford', 'Batsman', 'C', 0.31, 66, 'Overseas', "A young batting talent building a growing reputation for clean, positive hitting."),
  makePlayer(128, 'Mayank Markande', 'Bowler', 'C', 0.72, 76, 'Indian', "A death-overs specialist who backs his yorkers and slower balls in the closing stages."),
  makePlayer(129, 'AM Ghazanfar', 'Bowler', 'C', 0.7, 76, 'Indian', "A new-ball bowler who looks to make early inroads with movement off the seam."),
  makePlayer(130, 'Ashwani Kumar', 'Bowler', 'C', 0.67, 75, 'Indian', "A disciplined seam bowler who relies on consistent lines and lengths."),
  makePlayer(131, 'Corbin Bosch', 'All-rounder', 'C', 0.44, 69, 'Overseas', "A lower-order hitter who also offers a handy over or two of medium pace."),
  makePlayer(132, 'Deepak Chahar', 'Bowler', 'B', 0.93, 77, 'Indian', "A promising pace option capable of hitting good areas under pressure."),
  makePlayer(133, 'Hardik Pandya', 'All-rounder', 'Icon', 2.0, 95, 'Indian', "A powerful hitter and handy seam-bowling option, built for the pressure moments of a run chase."),
  makePlayer(134, 'Jasprit Bumrah', 'Bowler', 'Icon', 2.0, 96, 'Indian', "A yorker specialist with an unorthodox action, widely regarded as one of the format\'s most lethal death bowlers."),
  makePlayer(135, 'Mitchell Santner', 'All-rounder', 'B', 0.95, 78, 'Overseas', "An all-rounder in the making, valued for his fielding and his willingness to contribute in every discipline."),
  makePlayer(136, 'Naman Dhir', 'All-rounder', 'C', 0.52, 71, 'Indian', "A canny finisher with the bat who can also turn his arm over in a pinch."),
  makePlayer(137, 'Raghu Sharma', 'Bowler', 'C', 0.33, 67, 'Indian', "A crafty spinner who uses flight and variation to trouble batsmen in the middle overs."),
  makePlayer(138, 'Raj Bawa', 'All-rounder', 'C', 0.64, 74, 'Indian', "A hard-hitting all-rounder who provides balance lower down the order."),
  makePlayer(139, 'Robin Minz', 'Wicketkeeper', 'C', 0.64, 74, 'Indian', "An attacking wicketkeeper-batsman who looks to counter-attack from the top of the order."),
  makePlayer(140, 'Rohit Sharma', 'Batsman', 'Icon', 2.0, 91, 'Indian', "An elegant opener with a rare gift for timing the ball and dismantling bowling attacks in boundary-heavy overs."),
  makePlayer(141, 'Ryan Rickelton', 'Wicketkeeper', 'B', 1.19, 80, 'Overseas', "A promising young gloveman with a compact technique against both pace and spin."),
  makePlayer(142, 'Suryakumar Yadav', 'Batsman', 'A', 1.77, 86, 'Indian', "A 360-degree batsman with the ability to manufacture boundaries to any part of the ground."),
  makePlayer(143, 'Tilak Varma', 'Batsman', 'A', 1.63, 85, 'Indian', "A composed left-handed middle-order batsman who anchors an innings before accelerating late."),
  makePlayer(144, 'Trent Boult', 'Bowler', 'A', 1.94, 88, 'Overseas', "A left-arm swing bowler renowned for taking the new ball away from right-handers with the seam upright."),
  makePlayer(145, 'Will Jacks', 'All-rounder', 'B', 1.15, 80, 'Overseas', "A genuine utility all-rounder who chips in with both bat and ball whenever called upon."),
  makePlayer(146, 'Quinton de Kock', 'Wicketkeeper', 'B', 1.03, 78, 'Overseas', "A tidy wicketkeeper-batsman who offers reliability behind the stumps and handy runs in the middle order."),
  makePlayer(147, 'Atharva Ankolekar', 'All-rounder', 'C', 0.54, 72, 'Indian', "A lower-order hitter who also offers a handy over or two of medium pace."),
  makePlayer(148, 'Mohammad Izhar', 'Bowler', 'C', 0.63, 74, 'Indian', "A raw-pace bowler still sharpening his control but always a live wicket-taking threat."),
  makePlayer(149, 'Danish Malewar', 'Batsman', 'C', 0.39, 68, 'Indian', "A busy accumulator of runs, adept at rotating strike and finding the gaps."),
  makePlayer(150, 'Mayank Rawat', 'Batsman', 'C', 0.44, 69, 'Indian', "A dependable top-order batsman who values a solid base before looking to accelerate."),
  makePlayer(151, 'Arshdeep Singh', 'Bowler', 'A', 2.0, 89, 'Indian', "A left-arm pacer with excellent control at the death and a knack for the crucial breakthrough."),
  makePlayer(152, 'Azmatullah Omarzai', 'All-rounder', 'C', 0.59, 73, 'Overseas', "An all-rounder in the making, valued for his fielding and his willingness to contribute in every discipline."),
  makePlayer(153, 'Harnoor Singh Pannu', 'Batsman', 'C', 0.5, 71, 'Indian', "A middle-order batsman known for calm, composed innings under pressure."),
  makePlayer(154, 'Harpreet Brar', 'All-rounder', 'C', 0.53, 72, 'Indian', "A canny finisher with the bat who can also turn his arm over in a pinch."),
  makePlayer(155, 'Lockie Ferguson', 'Bowler', 'B', 0.97, 78, 'Overseas', "A death-overs specialist who backs his yorkers and slower balls in the closing stages."),
  makePlayer(156, 'Marco Jansen', 'All-rounder', 'B', 1.03, 78, 'Overseas', "A hard-hitting all-rounder who provides balance lower down the order."),
  makePlayer(157, 'Marcus Stoinis', 'All-rounder', 'B', 1.1, 79, 'Overseas', "A genuine utility all-rounder who chips in with both bat and ball whenever called upon."),
  makePlayer(158, 'Mitch Owen', 'All-rounder', 'C', 0.56, 72, 'Overseas', "A lower-order hitter who also offers a handy over or two of medium pace."),
  makePlayer(159, 'Musheer Khan', 'All-rounder', 'C', 0.4, 69, 'Indian', "An all-rounder in the making, valued for his fielding and his willingness to contribute in every discipline."),
  makePlayer(160, 'Nehal Wadhera', 'Batsman', 'C', 0.4, 68, 'Indian', "An aggressive strokeplayer who looks to seize the initiative early in the innings."),
  makePlayer(161, 'Prabhsimran Singh', 'Wicketkeeper', 'C', 0.33, 67, 'Indian', "An attacking wicketkeeper-batsman who looks to counter-attack from the top of the order."),
  makePlayer(162, 'Priyansh Arya', 'Batsman', 'C', 0.58, 73, 'Indian', "A gritty opener who prefers to see off the new ball before cutting loose."),
  makePlayer(163, 'Pyla Avinash', 'Batsman', 'C', 0.4, 69, 'Indian', "A young batting talent building a growing reputation for clean, positive hitting."),
  makePlayer(164, 'Shashank Singh', 'All-rounder', 'B', 1.44, 82, 'Indian', "A canny finisher with the bat who can also turn his arm over in a pinch."),
  makePlayer(165, 'Shreyas Iyer', 'Batsman', 'A', 1.93, 88, 'Indian', "A dependable middle-order batsman and captain known for calm decision-making under pressure."),
  makePlayer(166, 'Suryansh Shedge', 'All-rounder', 'C', 0.33, 67, 'Indian', "A hard-hitting all-rounder who provides balance lower down the order."),
  makePlayer(167, 'Vishnu Vinod', 'Wicketkeeper', 'C', 0.41, 69, 'Indian', "A promising young gloveman with a compact technique against both pace and spin."),
  makePlayer(168, 'Vyshak Vijaykumar', 'Bowler', 'C', 0.6, 73, 'Indian', "A new-ball bowler who looks to make early inroads with movement off the seam."),
  makePlayer(169, 'Xavier Bartlett', 'Bowler', 'C', 0.4, 68, 'Overseas', "A disciplined seam bowler who relies on consistent lines and lengths."),
  makePlayer(170, 'Yash Thakur', 'Bowler', 'C', 0.36, 67, 'Indian', "A promising pace option capable of hitting good areas under pressure."),
  makePlayer(171, 'Yuzvendra Chahal', 'Bowler', 'A', 1.97, 89, 'Indian', "A leading wicket-taking leg-spinner known for turning games with sharp, attacking variations."),
  makePlayer(172, 'Ben Dwarshuis', 'Bowler', 'C', 0.56, 72, 'Overseas', "A crafty spinner who uses flight and variation to trouble batsmen in the middle overs."),
  makePlayer(173, 'Cooper Connolly', 'All-rounder', 'C', 0.51, 71, 'Overseas', "A genuine utility all-rounder who chips in with both bat and ball whenever called upon."),
  makePlayer(174, 'Vishal Nishad', 'Bowler', 'C', 0.65, 75, 'Indian', "A raw-pace bowler still sharpening his control but always a live wicket-taking threat."),
  makePlayer(175, 'Pravin Dubey', 'Bowler', 'C', 0.66, 75, 'Indian', "A death-overs specialist who backs his yorkers and slower balls in the closing stages."),
  makePlayer(176, 'Donovan Ferreira', 'All-rounder', 'C', 0.39, 68, 'Overseas', "A lower-order hitter who also offers a handy over or two of medium pace."),
  makePlayer(177, 'Ravindra Jadeja', 'All-rounder', 'A', 1.55, 84, 'Indian', "A world-class fielder and left-arm spinner who also finishes overs with brisk, effective hitting."),
  makePlayer(178, 'Sam Curran', 'All-rounder', 'B', 1.16, 80, 'Overseas', "An all-rounder in the making, valued for his fielding and his willingness to contribute in every discipline."),
  makePlayer(179, 'Dhruv Jurel', 'Wicketkeeper', 'B', 1.15, 80, 'Indian', "A tidy wicketkeeper-batsman who offers reliability behind the stumps and handy runs in the middle order."),
  makePlayer(180, 'Jofra Archer', 'Bowler', 'A', 1.73, 86, 'Overseas', "A genuinely fast bowler with a smooth action and the ability to bowl in any phase of the innings."),
  makePlayer(181, 'Kwena Maphaka', 'Bowler', 'C', 0.63, 74, 'Overseas', "A new-ball bowler who looks to make early inroads with movement off the seam."),
  makePlayer(182, 'Lhuan-dre Pretorius', 'Batsman', 'C', 0.6, 73, 'Overseas', "A busy accumulator of runs, adept at rotating strike and finding the gaps."),
  makePlayer(183, 'Nandre Burger', 'Bowler', 'C', 0.74, 77, 'Overseas', "A disciplined seam bowler who relies on consistent lines and lengths."),
  makePlayer(184, 'Riyan Parag', 'All-rounder', 'B', 0.96, 78, 'Indian', "A canny finisher with the bat who can also turn his arm over in a pinch."),
  makePlayer(185, 'Sandeep Sharma', 'Bowler', 'C', 0.48, 70, 'Indian', "A promising pace option capable of hitting good areas under pressure."),
  makePlayer(186, 'Shimron Hetmyer', 'Batsman', 'B', 1.1, 79, 'Overseas', "A dependable top-order batsman who values a solid base before looking to accelerate."),
  makePlayer(187, 'Shubham Dubey', 'Batsman', 'C', 0.69, 75, 'Indian', "A middle-order batsman known for calm, composed innings under pressure."),
  makePlayer(188, 'Tushar Deshpande', 'Bowler', 'C', 0.41, 69, 'Indian', "A crafty spinner who uses flight and variation to trouble batsmen in the middle overs."),
  makePlayer(189, 'Vaibhav Suryavanshi', 'Batsman', 'C', 0.39, 68, 'Indian', "An aggressive strokeplayer who looks to seize the initiative early in the innings."),
  makePlayer(190, 'Yashasvi Jaiswal', 'Batsman', 'A', 1.72, 86, 'Indian', "A fearless left-handed opener who takes the attack to the bowlers from ball one."),
  makePlayer(191, 'Yudhvir Singh Charak', 'Bowler', 'C', 0.49, 71, 'Indian', "A raw-pace bowler still sharpening his control but always a live wicket-taking threat."),
  makePlayer(192, 'Ravi Bishnoi', 'Bowler', 'B', 1.07, 79, 'Indian', "A death-overs specialist who backs his yorkers and slower balls in the closing stages."),
  makePlayer(193, 'Adam Milne', 'Bowler', 'C', 0.41, 69, 'Overseas', "A new-ball bowler who looks to make early inroads with movement off the seam."),
  makePlayer(194, 'Ravi Singh', 'Bowler', 'C', 0.72, 76, 'Indian', "A disciplined seam bowler who relies on consistent lines and lengths."),
  makePlayer(195, 'Sushant Mishra', 'Bowler', 'C', 0.5, 71, 'Indian', "A promising pace option capable of hitting good areas under pressure."),
  makePlayer(196, 'Kuldeep Sen', 'Bowler', 'C', 0.69, 75, 'Indian', "A crafty spinner who uses flight and variation to trouble batsmen in the middle overs."),
  makePlayer(197, 'Vignesh Puthur', 'Bowler', 'C', 0.55, 72, 'Indian', "A raw-pace bowler still sharpening his control but always a live wicket-taking threat."),
  makePlayer(198, 'Yash Punja', 'Batsman', 'C', 0.32, 67, 'Indian', "A gritty opener who prefers to see off the new ball before cutting loose."),
  makePlayer(199, 'Aman Rao', 'Batsman', 'C', 0.75, 77, 'Indian', "A young batting talent building a growing reputation for clean, positive hitting."),
  makePlayer(200, 'Brijesh Sharma', 'Batsman', 'C', 0.68, 75, 'Indian', "A busy accumulator of runs, adept at rotating strike and finding the gaps."),
  makePlayer(201, 'Virat Kohli', 'Batsman', 'Icon', 2.0, 96, 'Indian', "A prolific top-order batsman renowned for his consistency, chase-mastery, and relentless intensity."),
  makePlayer(202, 'Phil Salt', 'Wicketkeeper', 'B', 1.46, 83, 'Overseas', "An attacking wicketkeeper-batsman who looks to counter-attack from the top of the order."),
  makePlayer(203, 'Devdutt Padikkal', 'Batsman', 'C', 0.68, 75, 'Indian', "A dependable top-order batsman who values a solid base before looking to accelerate."),
  makePlayer(204, 'Rajat Patidar', 'Batsman', 'B', 1.0, 78, 'Indian', "A middle-order batsman known for calm, composed innings under pressure."),
  makePlayer(205, 'Tim David', 'All-rounder', 'B', 1.19, 80, 'Overseas', "A hard-hitting all-rounder who provides balance lower down the order."),
  makePlayer(206, 'Krunal Pandya', 'All-rounder', 'B', 1.03, 78, 'Indian', "A genuine utility all-rounder who chips in with both bat and ball whenever called upon."),
  makePlayer(207, 'Romario Shepherd', 'All-rounder', 'C', 0.48, 70, 'Overseas', "A lower-order hitter who also offers a handy over or two of medium pace."),
  makePlayer(208, 'Jitesh Sharma', 'Wicketkeeper', 'C', 0.33, 67, 'Indian', "A promising young gloveman with a compact technique against both pace and spin."),
  makePlayer(209, 'Bhuvneshwar Kumar', 'Bowler', 'B', 1.13, 79, 'Indian', "A death-overs specialist who backs his yorkers and slower balls in the closing stages."),
  makePlayer(210, 'Yash Dayal', 'Bowler', 'C', 0.74, 77, 'Indian', "A new-ball bowler who looks to make early inroads with movement off the seam."),
  makePlayer(211, 'Josh Hazlewood', 'Bowler', 'A', 1.63, 85, 'Overseas', "A relentlessly accurate fast bowler who lets the seam and a full length do the talking."),
  makePlayer(212, 'Suyash Sharma', 'Bowler', 'C', 0.65, 75, 'Indian', "A disciplined seam bowler who relies on consistent lines and lengths."),
  makePlayer(213, 'Abhinandan Singh', 'Bowler', 'C', 0.5, 71, 'Indian', "A promising pace option capable of hitting good areas under pressure."),
  makePlayer(214, 'Jacob Bethell', 'All-rounder', 'C', 0.49, 71, 'Overseas', "An all-rounder in the making, valued for his fielding and his willingness to contribute in every discipline."),
  makePlayer(215, 'Nuwan Thushara', 'Bowler', 'C', 0.73, 77, 'Overseas', "A crafty spinner who uses flight and variation to trouble batsmen in the middle overs."),
  makePlayer(216, 'Rasikh Dar', 'Bowler', 'C', 0.75, 77, 'Indian', "A raw-pace bowler still sharpening his control but always a live wicket-taking threat."),
  makePlayer(217, 'Swapnil Singh', 'All-rounder', 'C', 0.55, 72, 'Indian', "A canny finisher with the bat who can also turn his arm over in a pinch."),
  makePlayer(218, 'Venkatesh Iyer', 'All-rounder', 'B', 1.33, 81, 'Indian', "A hard-hitting all-rounder who provides balance lower down the order."),
  makePlayer(219, 'Mangesh Yadav', 'Bowler', 'C', 0.37, 68, 'Indian', "A death-overs specialist who backs his yorkers and slower balls in the closing stages."),
  makePlayer(220, 'Jacob Duffy', 'Bowler', 'C', 0.43, 69, 'Overseas', "A new-ball bowler who looks to make early inroads with movement off the seam."),
  makePlayer(221, 'Jordan Cox', 'Wicketkeeper', 'C', 0.74, 77, 'Overseas', "A tidy wicketkeeper-batsman who offers reliability behind the stumps and handy runs in the middle order."),
  makePlayer(222, 'Satvik Deswal', 'Batsman', 'C', 0.56, 72, 'Indian', "An aggressive strokeplayer who looks to seize the initiative early in the innings."),
  makePlayer(223, 'Vicky Ostwal', 'Bowler', 'C', 0.54, 72, 'Indian', "A disciplined seam bowler who relies on consistent lines and lengths."),
  makePlayer(224, 'Vihaan Malhotra', 'Batsman', 'C', 0.64, 74, 'Indian', "A gritty opener who prefers to see off the new ball before cutting loose."),
  makePlayer(225, 'Kanishk Chouhan', 'Batsman', 'C', 0.33, 67, 'Indian', "A young batting talent building a growing reputation for clean, positive hitting."),
  makePlayer(226, 'Abhishek Sharma', 'Batsman', 'A', 1.79, 87, 'Indian', "An aggressive left-handed opener who looks to seize the powerplay from the very first over."),
  makePlayer(227, 'Aniket Verma', 'Batsman', 'C', 0.53, 72, 'Indian', "A busy accumulator of runs, adept at rotating strike and finding the gaps."),
  makePlayer(228, 'Brydon Carse', 'Bowler', 'C', 0.68, 75, 'Overseas', "A promising pace option capable of hitting good areas under pressure."),
  makePlayer(229, 'Eshan Malinga', 'Bowler', 'C', 0.37, 68, 'Indian', "A crafty spinner who uses flight and variation to trouble batsmen in the middle overs."),
  makePlayer(230, 'Harsh Dubey', 'All-rounder', 'C', 0.73, 77, 'Indian', "A genuine utility all-rounder who chips in with both bat and ball whenever called upon."),
  makePlayer(231, 'Harshal Patel', 'Bowler', 'B', 0.95, 77, 'Indian', "A raw-pace bowler still sharpening his control but always a live wicket-taking threat."),
  makePlayer(232, 'Heinrich Klaasen', 'Wicketkeeper', 'A', 1.59, 84, 'Overseas', "A hard-hitting wicketkeeper-batsman who can flip a game in a few overs of clean hitting."),
  makePlayer(233, 'Ishan Kishan', 'Wicketkeeper', 'B', 1.26, 81, 'Indian', "An attacking wicketkeeper-batsman who looks to counter-attack from the top of the order."),
  makePlayer(234, 'Jaydev Unadkat', 'Bowler', 'C', 0.6, 73, 'Indian', "A death-overs specialist who backs his yorkers and slower balls in the closing stages."),
  makePlayer(235, 'Kamindu Mendis', 'All-rounder', 'C', 0.41, 69, 'Overseas', "A lower-order hitter who also offers a handy over or two of medium pace."),
  makePlayer(236, 'Nitish Kumar Reddy', 'All-rounder', 'B', 0.97, 78, 'Indian', "An all-rounder in the making, valued for his fielding and his willingness to contribute in every discipline."),
  makePlayer(237, 'Pat Cummins', 'Bowler', 'A', 1.95, 88, 'Overseas', "A world-class fast bowler and captain with excellent control across all phases of an innings."),
  makePlayer(238, 'R Smaran', 'Batsman', 'C', 0.41, 69, 'Indian', "A dependable top-order batsman who values a solid base before looking to accelerate."),
  makePlayer(239, 'Travis Head', 'Batsman', 'A', 1.8, 87, 'Overseas', "An aggressive left-handed opener who takes the attack to bowlers from the very first ball."),
  makePlayer(240, 'Zeeshan Ansari', 'Bowler', 'C', 0.58, 73, 'Indian', "A new-ball bowler who looks to make early inroads with movement off the seam."),
  makePlayer(241, 'Liam Livingstone', 'All-rounder', 'B', 1.15, 80, 'Overseas', "A canny finisher with the bat who can also turn his arm over in a pinch."),
  makePlayer(242, 'Jack Edwards', 'All-rounder', 'C', 0.56, 72, 'Overseas', "A hard-hitting all-rounder who provides balance lower down the order."),
  makePlayer(243, 'Salil Arora', 'Batsman', 'C', 0.54, 72, 'Indian', "A middle-order batsman known for calm, composed innings under pressure."),
  makePlayer(244, 'Shivam Mavi', 'Bowler', 'C', 0.72, 76, 'Indian', "A disciplined seam bowler who relies on consistent lines and lengths."),
  makePlayer(245, 'Shivang Kumar', 'Bowler', 'C', 0.39, 68, 'Indian', "A promising pace option capable of hitting good areas under pressure."),
  makePlayer(246, 'Krains Fuletra', 'Batsman', 'C', 0.62, 74, 'Indian', "An aggressive strokeplayer who looks to seize the initiative early in the innings."),
  makePlayer(247, 'Praful Hinge', 'Bowler', 'C', 0.41, 69, 'Indian', "A crafty spinner who uses flight and variation to trouble batsmen in the middle overs."),
  makePlayer(248, 'Amit Kumar', 'Bowler', 'C', 0.48, 70, 'Indian', "A raw-pace bowler still sharpening his control but always a live wicket-taking threat."),
  makePlayer(249, 'Onkar Tarmale', 'Bowler', 'C', 0.6, 73, 'Indian', "A death-overs specialist who backs his yorkers and slower balls in the closing stages."),
  makePlayer(250, 'Sakib Hussain', 'Bowler', 'C', 0.43, 69, 'Indian', "A new-ball bowler who looks to make early inroads with movement off the seam."),
];



// -----------------------------------------------------------
// Bid increment rule — mimics real auction conventions:
// increments get larger as the price climbs
// -----------------------------------------------------------
function nextIncrement(currentPriceCr) {
  if (currentPriceCr < 1) return 0.2;
  if (currentPriceCr < 2) return 0.2;
  if (currentPriceCr < 5) return 0.25;
  if (currentPriceCr < 10) return 0.5;
  return 1.0;
}

function nextBid(currentPriceCr) {
  return roundTo(currentPriceCr + nextIncrement(currentPriceCr), 2);
}

function roundTo(value, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// -----------------------------------------------------------
// Team helpers
// -----------------------------------------------------------
function createTeam(name, isBot) {
  return {
    name,
    isBot,
    budget: 125,
    spent: 0,
    squad: [] // array of { player, price }
  };
}

function roleCount(team, role) {
  return team.squad.filter(s => s.player.role === role).length;
}

function overseasCount(team) {
  return team.squad.filter(s => s.player.nationality === 'Overseas').length;
}

function remainingBudget(team) {
  return roundTo(team.budget - team.spent, 2);
}

/**
 * Can this team legally afford/accept the next bid, given squad-size and
 * overseas-player caps? (Simplified IPL-style rules.)
 */
function canBid(team, player, bidAmount, opts = {}) {
  const maxSquad = opts.maxSquad ?? 25;
  const maxOverseas = opts.maxOverseas ?? 8;

  if (bidAmount > remainingBudget(team)) return false;
  if (team.squad.length >= maxSquad) return false;
  if (player.nationality === 'Overseas' && overseasCount(team) >= maxOverseas) return false;

  // Must always keep at least the minimum spend reserved for filling out
  // a minimum viable squad — a very light heuristic so teams don't blow
  // their whole budget on early players and get stuck unable to field 11.
  const minSquad = opts.minSquad ?? 18;
  const slotsLeftAfterThis = minSquad - (team.squad.length + 1);
  if (slotsLeftAfterThis > 0) {
    const reserve = slotsLeftAfterThis * 0.3; // cheapest tier price, as a floor
    if (remainingBudget(team) - bidAmount < reserve) return false;
  }

  return true;
}

// -----------------------------------------------------------
// Heuristic AI bot bidding decision
// (rule-based, not a trained model — deliberately simple and
// explainable: rating, role need, and remaining budget pressure)
// -----------------------------------------------------------
function botWillingness(team, player) {
  // Base willingness scales with player rating
  let willingness = player.basePrice + (player.rating / 100) * 6;

  // Role need bonus — bots value roles they're short on
  const currentInRole = roleCount(team, player.role);
  if (currentInRole === 0) willingness *= 1.5;
  else if (currentInRole < 3) willingness *= 1.15;

  // Wicketkeeper urgency — every team needs at least one
  if (player.role === 'Wicketkeeper' && roleCount(team, 'Wicketkeeper') === 0) {
    willingness *= 1.3;
  }

  return roundTo(willingness, 2);
}

/**
 * Decides whether a bot team bids at the given next-bid price.
 * Returns true/false. Includes a small random factor so bots don't
 * all behave identically deterministically.
 */
function botDecision(team, player, nextBidAmount, opts = {}) {
  const rng = opts.rng || Math.random;

  if (!canBid(team, player, nextBidAmount, opts)) return false;

  const willingness = botWillingness(team, player);
  if (nextBidAmount > willingness) return false;

  // Even below willingness, add a little randomness so bots occasionally
  // hold back (keeps auctions from feeling mechanical)
  return rng() < 0.82;
}

// -----------------------------------------------------------
// Team validation (simplified IPL-style squad rules)
// -----------------------------------------------------------
function validateTeam(team, opts = {}) {
  const minSquad = opts.minSquad ?? 18;
  const maxSquad = opts.maxSquad ?? 25;
  const maxOverseas = opts.maxOverseas ?? 8;

  const checks = [
    {
      key: 'squadSize',
      label: `Squad size between ${minSquad}-${maxSquad}`,
      pass: team.squad.length >= minSquad && team.squad.length <= maxSquad,
      detail: `${team.squad.length} players`
    },
    {
      key: 'overseasLimit',
      label: `Overseas players ≤ ${maxOverseas}`,
      pass: overseasCount(team) <= maxOverseas,
      detail: `${overseasCount(team)} overseas`
    },
    {
      key: 'hasKeeper',
      label: 'At least 1 wicketkeeper',
      pass: roleCount(team, 'Wicketkeeper') >= 1,
      detail: `${roleCount(team, 'Wicketkeeper')} keeper(s)`
    },
    {
      key: 'hasBowlers',
      label: 'At least 3 bowling options (Bowler + All-rounder)',
      pass: (roleCount(team, 'Bowler') + roleCount(team, 'All-rounder')) >= 3,
      detail: `${roleCount(team, 'Bowler') + roleCount(team, 'All-rounder')} bowling options`
    },
    {
      key: 'hasBatters',
      label: 'At least 3 batting options (Batsman + All-rounder)',
      pass: (roleCount(team, 'Batsman') + roleCount(team, 'All-rounder')) >= 3,
      detail: `${roleCount(team, 'Batsman') + roleCount(team, 'All-rounder')} batting options`
    }
  ];

  return { checks, allPass: checks.every(c => c.pass) };
}

// -----------------------------------------------------------
// Best XI auto-picker — simple greedy algorithm respecting
// minimum role constraints, then filling remaining slots by rating
// -----------------------------------------------------------
function pickBestXI(team, opts = {}) {
  const maxOverseasXI = opts.maxOverseasXI ?? 4;
  const squad = [...team.squad].sort((a, b) => b.player.rating - a.player.rating);

  const xi = [];
  const usedIds = new Set();
  let overseasInXI = 0;

  function tryAdd(entry) {
    if (xi.length >= 11) return false;
    if (usedIds.has(entry.player.id)) return false;
    if (entry.player.nationality === 'Overseas' && overseasInXI >= maxOverseasXI) return false;
    xi.push(entry);
    usedIds.add(entry.player.id);
    if (entry.player.nationality === 'Overseas') overseasInXI++;
    return true;
  }

  // Guarantee 1 wicketkeeper first (best available)
  const bestKeeper = squad.find(s => s.player.role === 'Wicketkeeper');
  if (bestKeeper) tryAdd(bestKeeper);

  // Guarantee at least 3 specialist bowlers
  const bowlers = squad.filter(s => s.player.role === 'Bowler');
  let addedBowlers = 0;
  for (const b of bowlers) {
    if (addedBowlers >= 3) break;
    if (tryAdd(b)) addedBowlers++;
  }

  // Guarantee at least 3 specialist batsmen
  const batsmen = squad.filter(s => s.player.role === 'Batsman');
  let addedBatsmen = 0;
  for (const b of batsmen) {
    if (addedBatsmen >= 3) break;
    if (tryAdd(b)) addedBatsmen++;
  }

  // Fill remaining slots with the best-rated players left, regardless of role
  for (const entry of squad) {
    if (xi.length >= 11) break;
    tryAdd(entry);
  }

  return xi;
}

// -----------------------------------------------------------
// Turn-based auction state machine — pure, DOM-free, so the whole
// auction flow (including bot decisions) can be driven and tested
// without any UI. The UI layer only needs to call userBid()/userPass()
// and re-render after each call.
// -----------------------------------------------------------
const USER_INDEX = 0;

function shuffle(arr, rng) {
  const random = rng || Math.random;
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Orders the player pool for auction: Icon tier first, then A, B, C,
 * shuffled within each tier so the exact order differs each run.
 */
function buildAuctionOrder(players, rng) {
  const tierOrder = ['Icon', 'A', 'B', 'C'];
  const grouped = tierOrder.map(tier => shuffle(players.filter(p => p.tier === tier), rng));
  return grouped.flat();
}

function createAuctionState(teamNames, opts = {}) {
  const rng = opts.rng || Math.random;
  const teams = teamNames.map((name, i) => createTeam(name, i !== USER_INDEX));
  const auctionOrder = buildAuctionOrder(PLAYERS.map(p => ({ ...p })), rng);

  const state = {
    teams,
    auctionOrder,
    playerIndex: 0,
    currentPrice: null,
    currentHighestBidderIndex: null,
    activeIndices: [],
    turnPointer: 0,
    soldLog: [], // { player, teamIndex, price } or { player, teamIndex: null } for unsold
    phase: 'auction', // 'auction' | 'complete'
    rng,
    ruleOpts: opts.ruleOpts || {}
  };

  startPlayerRound(state);
  return state;
}

function currentPlayer(state) {
  return state.auctionOrder[state.playerIndex] || null;
}

function startPlayerRound(state) {
  const player = currentPlayer(state);
  if (!player) {
    state.phase = 'complete';
    return;
  }
  state.currentPrice = player.basePrice;
  state.currentHighestBidderIndex = null;
  state.activeIndices = state.teams.map((_, i) => i);
  state.turnPointer = 0;
  processUntilUserTurn(state);
}

function finalizeSale(state) {
  const player = currentPlayer(state);
  if (state.currentHighestBidderIndex !== null) {
    const team = state.teams[state.currentHighestBidderIndex];
    team.squad.push({ player, price: state.currentPrice });
    team.spent = roundTo(team.spent + state.currentPrice, 2);
    state.soldLog.push({ player, teamIndex: state.currentHighestBidderIndex, price: state.currentPrice });
  } else {
    state.soldLog.push({ player, teamIndex: null, price: null });
  }

  state.playerIndex++;
  startPlayerRound(state);
}

/**
 * Advances the simulation, processing bot turns automatically, until
 * either the auction for the current player resolves (SOLD/UNSOLD and
 * the next player's round begins) or it's the user's turn to act.
 */
function processUntilUserTurn(state) {
  if (state.phase === 'complete') return;

  while (true) {
    if (state.activeIndices.length <= 1) {
      finalizeSale(state);
      return;
    }

    const pointer = state.turnPointer % state.activeIndices.length;
    const teamIndex = state.activeIndices[pointer];

    if (teamIndex === state.currentHighestBidderIndex) {
      state.turnPointer++;
      continue;
    }

    if (teamIndex === USER_INDEX) {
      return; // pause — waiting for userBid()/userPass()
    }

    // Bot turn
    const team = state.teams[teamIndex];
    const player = currentPlayer(state);
    const proposedPrice = nextBid(state.currentPrice);
    const willBid = botDecision(team, player, proposedPrice, { ...state.ruleOpts, rng: state.rng });

    if (willBid) {
      state.currentPrice = proposedPrice;
      state.currentHighestBidderIndex = teamIndex;
    } else {
      state.activeIndices = state.activeIndices.filter(i => i !== teamIndex);
    }
    state.turnPointer++;
  }
}

function userBid(state) {
  if (state.phase === 'complete') return;
  if (!state.activeIndices.includes(USER_INDEX)) return;
  if (state.currentHighestBidderIndex === USER_INDEX) return;

  const proposedPrice = nextBid(state.currentPrice);
  const team = state.teams[USER_INDEX];
  if (!canBid(team, currentPlayer(state), proposedPrice, state.ruleOpts)) return;

  state.currentPrice = proposedPrice;
  state.currentHighestBidderIndex = USER_INDEX;
  state.turnPointer++;
  processUntilUserTurn(state);
}

function userPass(state) {
  if (state.phase === 'complete') return;
  if (!state.activeIndices.includes(USER_INDEX)) return;

  state.activeIndices = state.activeIndices.filter(i => i !== USER_INDEX);
  state.turnPointer++;
  processUntilUserTurn(state);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ROLES, PLAYERS, REAL_TEAM_NAMES,
    nextIncrement, nextBid, roundTo,
    createTeam, roleCount, overseasCount, remainingBudget, canBid,
    botWillingness, botDecision,
    validateTeam, pickBestXI,
    createAuctionState, processUntilUserTurn, userBid, userPass,
    currentPlayer, USER_INDEX
  };
}
