
'use client';

import * as React from 'react';
import { Activity, Droplets, HeartPulse, Moon, Utensils, Brain, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function HealthToolsPage() {
  const [userId, setUserId] = React.useState<string | null>(null);
  
  const [bmiHeight, setBmiHeight] = React.useState('');
  const [bmiWeight, setBmiWeight] = React.useState('');
  const [bmiResult, setBmiResult] = React.useState<{ bmi: string, category: string, desc: string } | null>(null);
  
  const [waterGoal, setWaterGoal] = React.useState(8);
  const [waterConsumed, setWaterConsumed] = React.useState(0);
  const [isLoadingWater, setIsLoadingWater] = React.useState(true);

  React.useEffect(() => {
    const loadWater = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoadingWater(false);
          return;
        }
        setUserId(user.id);

        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('health_tracking')
          .select('*')
          .eq('user_id', user.id)
          .eq('tracking_date', today)
          .single();

        if (data) {
          setWaterConsumed(data.water_consumed);
          if (data.water_goal) setWaterGoal(data.water_goal);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoadingWater(false);
      }
    };
    loadWater();
  }, []);

  const updateWater = async (newAmount: number) => {
    const safeAmount = Math.max(0, newAmount);
    setWaterConsumed(safeAmount);
    if (!userId) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      await supabase.from('health_tracking').upsert({
        user_id: userId,
        tracking_date: today,
        water_goal: waterGoal,
        water_consumed: safeAmount,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,tracking_date' });
    } catch (err) {
      toast.error('Failed to save water tracker progress.');
    }
  };

  const calculateBMI = (e: React.FormEvent) => {
    e.preventDefault();
    const h = parseFloat(bmiHeight) / 100;
    const w = parseFloat(bmiWeight);
    if (h > 0 && w > 0) {
      const bmi = (w / (h * h)).toFixed(1);
      const val = parseFloat(bmi);
      let category = '';
      let desc = '';
      if (val < 18.5) { category = 'Underweight'; desc = 'Consider consulting a healthcare provider.'; }
      else if (val < 25) { category = 'Normal'; desc = 'You are within a healthy weight range.'; }
      else if (val < 30) { category = 'Overweight'; desc = 'Consider lifestyle changes for better health.'; }
      else { category = 'Obese'; desc = 'Please consult a healthcare provider for advice.'; }
      
      setBmiResult({ bmi, category, desc });
    }
  };

  return (
    <div className='container mx-auto px-4 max-w-5xl py-8 space-y-8'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold tracking-tight mb-2'>Health Tools</h1>
        <p className='text-muted-foreground text-lg'>
          Simple tools to help you understand and track your health.
        </p>
      </div>

      <div className='grid md:grid-cols-2 gap-6'>
        
        {/* BMI Calculator */}
        <Card className='border-border/50 shadow-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <HeartPulse className='h-5 w-5 text-primary' />
              BMI Calculator
            </CardTitle>
            <CardDescription>Calculate your Body Mass Index</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={calculateBMI} className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='height'>Height (cm)</Label>
                  <Input id='height' type='number' required value={bmiHeight} onChange={(e) => setBmiHeight(e.target.value)} placeholder='175' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='weight'>Weight (kg)</Label>
                  <Input id='weight' type='number' required value={bmiWeight} onChange={(e) => setBmiWeight(e.target.value)} placeholder='70' />
                </div>
              </div>
              <Button type='submit' className='w-full'>Calculate BMI</Button>
            </form>
            
            {bmiResult && (
              <div className='mt-6 p-4 rounded-lg bg-secondary/50 border flex flex-col items-center text-center'>
                <div className='text-4xl font-bold text-primary mb-1'>{bmiResult.bmi}</div>
                <div className='font-semibold text-lg mb-1'>{bmiResult.category}</div>
                <div className='text-sm text-muted-foreground'>{bmiResult.desc}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Water Tracker */}
        <Card className='border-border/50 shadow-sm'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Droplets className='h-5 w-5 text-blue-500' />
              Water Tracker
            </CardTitle>
            <CardDescription>Track your daily water intake</CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col items-center py-6'>
            <div className='relative h-40 w-40 flex items-center justify-center rounded-full border-8 border-secondary mb-6'>
              {/* Progress Circle visual mock */}
              <div 
                className='absolute inset-0 rounded-full border-8 border-blue-500 transition-all duration-500' 
                style={{ clipPath: `inset(${100 - Math.min((waterConsumed/waterGoal)*100, 100)}% 0 0 0)` }} 
              />
              <div className='text-center z-10 bg-card/80 rounded-full p-2'>
                <div className='text-3xl font-bold text-blue-500'>{waterConsumed} <span className='text-lg text-muted-foreground'>/ {waterGoal}</span></div>
                <div className='text-sm text-muted-foreground'>glasses</div>
              </div>
            </div>
            
            <div className='flex gap-2 w-full'>
              <Button variant='outline' className='flex-1' onClick={() => updateWater(waterConsumed - 1)} disabled={isLoadingWater}>-1</Button>
              <Button className='flex-1 bg-blue-500 hover:bg-blue-600' onClick={() => updateWater(waterConsumed + 1)} disabled={isLoadingWater}>+1 Glass</Button>
              <Button className='flex-1 bg-blue-500 hover:bg-blue-600' onClick={() => updateWater(waterConsumed + 2)} disabled={isLoadingWater}>+2 Glasses</Button>
            </div>
          </CardContent>
          <CardFooter className='justify-center border-t pt-4'>
            <Button variant='ghost' size='sm' onClick={() => updateWater(0)} disabled={isLoadingWater}>Reset Progress</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Health Tips */}
      <section>
        <h2 className='text-xl font-bold tracking-tight mb-4'>Daily Health Tips</h2>
        <div className='grid sm:grid-cols-2 lg:grid-cols-4 gap-4'>
          {[
            { icon: Activity, title: 'Physical Activity', desc: 'Aim for at least 30 minutes of moderate physical activity every day.' },
            { icon: Utensils, title: 'Nutrition', desc: 'Incorporate more leafy greens and whole grains into your daily diet.' },
            { icon: Moon, title: 'Sleep', desc: 'Ensure you get 7-9 hours of quality sleep each night for optimal recovery.' },
            { icon: Brain, title: 'Stress Management', desc: 'Practice mindfulness or meditation for 10 minutes daily to reduce stress.' },
          ].map((tip, i) => (
            <Card key={i} className='border-border/50 shadow-sm'>
              <CardHeader className='pb-2'>
                <div className='h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mb-2'>
                  <tip.icon className='h-4 w-4 text-primary' />
                </div>
                <CardTitle className='text-base'>{tip.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground'>{tip.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

    </div>
  );
}

